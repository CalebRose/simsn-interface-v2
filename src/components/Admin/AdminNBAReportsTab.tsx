import { useMemo, useState } from "react";
import { SimNBA } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { NBAPlayer, NBATeam } from "../../models/basketballModels";

const getNBATeamName = (t?: NBATeam | null): string => {
  if (!t) return "";
  return t.Nickname ? `${t.Team} ${t.Nickname}` : t.Team;
};

export const AdminNBAReportsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    nbaTeams,
    nbaTeamMap,
    cbb_Timestamp,
    proRosterMap,
    capsheetMap,
    nbaLineupMap,
  } = useSimBBAStore();

  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const leagueCap = cbb_Timestamp?.Y1Capspace && cbb_Timestamp.Y1Capspace > 0
    ? cbb_Timestamp.Y1Capspace
    : 140; // Default $140M if not set

  // 1. Salary Cap Breaches
  const capBreaches = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      capLimit: number;
      totalCap: number;
      overage: number;
    }> = [];

    (nbaTeams || []).forEach((team) => {
      const capsheet = capsheetMap?.[team.ID];
      let totalPayroll = Number(capsheet?.Year1Total ?? 0);

      // Fallback: calculate from player contracts if capsheet is 0
      if (totalPayroll === 0 && proRosterMap?.[team.ID]) {
        const roster = proRosterMap[team.ID] || [];
        totalPayroll = roster.reduce((sum, p: any) => {
          const c = p.Contract || p.NBAContract;
          const y1 = c?.Year1Total ?? c?.Year1 ?? c?.ContractLength ? (c?.TotalCost / c?.ContractLength) : 0;
          return sum + (Number(y1) || 0);
        }, 0);
      }

      const overage = totalPayroll - leagueCap;
      if (overage > 0.05 || capsheet?.IsOverMax) {
        list.push({
          teamID: team.ID,
          teamName: getNBATeamName(team),
          capLimit: leagueCap,
          totalCap: totalPayroll,
          overage: overage > 0 ? overage : 0,
        });
      }
    });

    return list.sort((a, b) => b.overage - a.overage);
  }, [nbaTeams, capsheetMap, proRosterMap, leagueCap]);

  // 2. Roster Limit Breaches
  const rosterBreaches = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      activeCount: number;
      twoWayCount: number;
      totalCount: number;
      issue: string;
    }> = [];

    (nbaTeams || []).forEach((team) => {
      const roster: NBAPlayer[] = proRosterMap?.[team.ID] || [];
      const twoWay = roster.filter((p: any) => p.IsTwoWay || p.IsGLeague).length;
      const active = roster.length - twoWay;
      const issues: string[] = [];

      if (active > 15) {
        issues.push(`Over active limit (${active}/15)`);
      } else if (active < 12 && roster.length > 0) {
        issues.push(`Under active roster minimum (${active}/12)`);
      }

      if (twoWay > 3) {
        issues.push(`Too many Two-Way/G-League players (${twoWay}/3)`);
      }

      if (roster.length > 18) {
        issues.push(`Total roster limit exceeded (${roster.length}/18)`);
      }

      if (issues.length > 0) {
        list.push({
          teamID: team.ID,
          teamName: getNBATeamName(team),
          activeCount: active,
          twoWayCount: twoWay,
          totalCount: roster.length,
          issue: issues.join("; "),
        });
      }
    });

    return list.sort((a, b) => b.activeCount - a.activeCount);
  }, [nbaTeams, proRosterMap]);

  // 3. Injured Players on Active Lineup
  const injuredOnLineups = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      slot: string;
      playerName: string;
      position: string;
      injuryType: string;
      weeksOfRecovery: number;
    }> = [];

    (nbaTeams || []).forEach((team) => {
      const teamRoster = proRosterMap?.[team.ID] || [];
      const playerMap = new Map<number, NBAPlayer>();
      teamRoster.forEach((p) => playerMap.set(p.ID, p));

      const lineups = nbaLineupMap?.[team.ID] || [];

      lineups.forEach((l) => {
        const pos = l.Position || "G/F";
        const checkSlot = (pid: number, stringLabel: string) => {
          if (!pid || pid <= 0) return;
          const player = playerMap.get(pid);
          if (player && (player.IsInjured || (player.WeeksOfRecovery ?? 0) > 0)) {
            list.push({
              teamID: team.ID,
              teamName: getNBATeamName(team),
              slot: `${pos} (${stringLabel})`,
              playerName: `${player.FirstName} ${player.LastName}`,
              position: player.Position || pos,
              injuryType: player.InjuryType || "Injured",
              weeksOfRecovery: player.WeeksOfRecovery || 1,
            });
          }
        };

        checkSlot(l.FirstStringID, "Starter");
        checkSlot(l.SecondStringID, "2nd String");
        checkSlot(l.ThirdStringID, "3rd String");
      });
    });

    return list;
  }, [nbaTeams, proRosterMap, nbaLineupMap]);

  // 4. Missing / Traded / Released Players on Lineups
  const missingOnLineups = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      slot: string;
      playerID: number;
      reason: string;
    }> = [];

    (nbaTeams || []).forEach((team) => {
      const teamRoster = proRosterMap?.[team.ID] || [];
      const rosterIDs = new Set<number>(teamRoster.map((p) => p.ID));

      const lineups = nbaLineupMap?.[team.ID] || [];

      lineups.forEach((l) => {
        const pos = l.Position || "G/F";
        const checkSlot = (pid: number, stringLabel: string) => {
          if (!pid || pid <= 0) return;
          if (!rosterIDs.has(pid)) {
            list.push({
              teamID: team.ID,
              teamName: getNBATeamName(team),
              slot: `${pos} (${stringLabel})`,
              playerID: pid,
              reason: "Player ID no longer on active team roster (traded/cut)",
            });
          }
        };

        checkSlot(l.FirstStringID, "Starter");
        checkSlot(l.SecondStringID, "2nd String");
        checkSlot(l.ThirdStringID, "3rd String");
      });
    });

    return list;
  }, [nbaTeams, proRosterMap, nbaLineupMap]);

  // Dropdown team filter
  const teamOptions = useMemo(() => {
    const list = (nbaTeams || [])
      .map((t) => ({
        label: getNBATeamName(t),
        value: t.ID.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: "All Teams", value: "ALL" }, ...list];
  }, [nbaTeams]);

  // Filtered views
  const filterByTeamAndSearch = <T extends { teamID: number; teamName: string }>(
    items: T[],
  ): T[] => {
    return items.filter((item) => {
      if (selectedTeam !== "ALL" && item.teamID !== Number(selectedTeam)) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const str = JSON.stringify(item).toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  };

  const filteredCapBreaches = filterByTeamAndSearch(capBreaches);
  const filteredRosterBreaches = filterByTeamAndSearch(rosterBreaches);
  const filteredInjured = filterByTeamAndSearch(injuredOnLineups);
  const filteredMissing = filterByTeamAndSearch(missingOnLineups);

  return (
    <div className="flex flex-col gap-y-4 w-full p-2">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimNBA League Health & Violation Reports
          </Text>
          <Text variant="small" classes="text-gray-400">
            Automated monitoring of salary cap limits, roster sizes, and injured/invalid players in active lineups.
          </Text>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-red-400">
            Cap Breaches
          </Text>
          <Text variant="h5" classes="font-bold text-red-400">
            {capBreaches.length}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-yellow-400">
            Roster Limit Breaches
          </Text>
          <Text variant="h5" classes="font-bold text-yellow-400">
            {rosterBreaches.length}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-orange-400">
            Injured in Lineups
          </Text>
          <Text variant="h5" classes="font-bold text-orange-400">
            {injuredOnLineups.length}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-blue-400">
            Invalid Lineup Slots
          </Text>
          <Text variant="h5" classes="font-bold text-blue-400">
            {missingOnLineups.length}
          </Text>
        </Border>
      </div>

      {/* Filter Controls */}
      <Border classes="p-4 flex flex-col md:flex-row gap-4 bg-gray-800/40 items-center justify-between">
        <div className="w-full md:w-72 flex flex-col">
          <span className="text-xs text-gray-400 mb-1">Filter by Team</span>
          <SelectDropdown
            options={teamOptions}
            value={{
              label:
                teamOptions.find((o) => o.value === selectedTeam)?.label ||
                selectedTeam,
              value: selectedTeam,
            }}
            onChange={(opt) => opt && setSelectedTeam(opt.value)}
          />
        </div>
        <div className="w-full md:w-72 flex flex-col">
          <span className="text-xs text-gray-400 mb-1">Search Table</span>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Search by team, player, slot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Border>

      {/* 1. Salary Cap Breaches Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              1. Salary Cap Breaches ({filteredCapBreaches.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Teams whose total payroll exceeds the league salary cap (${leagueCap.toFixed(2)}M).
            </Text>
          </div>
        </div>

        {filteredCapBreaches.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No salary cap breaches found. All NBA teams are within allowable cap space.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700 text-right">Cap Limit</th>
                  <th className="p-2 border border-gray-700 text-right">Total Payroll</th>
                  <th className="p-2 border border-gray-700 text-right">Overage Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredCapBreaches.map((b) => (
                  <tr
                    key={b.teamID}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="p-2 border border-gray-700 font-semibold text-white">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(SimNBA, b.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{b.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono">
                      ${b.capLimit.toFixed(2)}M
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono font-bold text-red-400">
                      ${b.totalCap.toFixed(2)}M
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono font-bold text-red-500">
                      +${b.overage.toFixed(2)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>

      {/* 2. Roster Breaches Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              2. Roster Limit Breaches ({filteredRosterBreaches.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Teams violating the 15-player active limit, 12-player minimum, or 18-player total roster limit.
            </Text>
          </div>
        </div>

        {filteredRosterBreaches.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No roster limit breaches found. All NBA teams meet roster requirements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700 text-center">Active Roster</th>
                  <th className="p-2 border border-gray-700 text-center">Two-Way / G-League</th>
                  <th className="p-2 border border-gray-700 text-center">Total Players</th>
                  <th className="p-2 border border-gray-700">Violation Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredRosterBreaches.map((b) => (
                  <tr
                    key={b.teamID}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="p-2 border border-gray-700 font-semibold text-white">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(SimNBA, b.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{b.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono font-bold text-yellow-400">
                      {b.activeCount} / 15
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono text-gray-300">
                      {b.twoWayCount} / 3
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono font-bold text-red-400">
                      {b.totalCount} / 18
                    </td>
                    <td className="p-2 border border-gray-700 text-yellow-300">
                      {b.issue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>

      {/* 3. Injured Players on Active Lineup Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              3. Injured Players in Active Lineups ({filteredInjured.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Lineup rotation slots containing injured players who should be resting or substituted.
            </Text>
          </div>
        </div>

        {filteredInjured.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No injured players found in any active NBA lineups!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700">Slot / String</th>
                  <th className="p-2 border border-gray-700">Player</th>
                  <th className="p-2 border border-gray-700">Position</th>
                  <th className="p-2 border border-gray-700">Injury Description</th>
                  <th className="p-2 border border-gray-700 text-center">Weeks Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredInjured.map((item, idx) => (
                  <tr
                    key={`inj-${idx}`}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="p-2 border border-gray-700 font-semibold text-white">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(SimNBA, item.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{item.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 font-mono font-bold text-yellow-400">
                      {item.slot}
                    </td>
                    <td className="p-2 border border-gray-700 font-semibold text-white">
                      {item.playerName}
                    </td>
                    <td className="p-2 border border-gray-700">{item.position}</td>
                    <td className="p-2 border border-gray-700 text-red-300">
                      {item.injuryType}
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono font-bold text-red-400">
                      {item.weeksOfRecovery} wk{item.weeksOfRecovery === 1 ? "" : "s"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>

      {/* 4. Missing / Invalid Lineup Slots Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              4. Lineup Roster Violations ({filteredMissing.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Lineup rotation slots containing player IDs that are no longer on the active team roster (cut/traded).
            </Text>
          </div>
        </div>

        {filteredMissing.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No lineup roster violations found. All slotted players are on active rosters.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700">Slot</th>
                  <th className="p-2 border border-gray-700">Player ID</th>
                  <th className="p-2 border border-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissing.map((item, idx) => (
                  <tr
                    key={`missing-${idx}`}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="p-2 border border-gray-700 font-semibold text-white">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(SimNBA, item.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{item.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 font-mono font-bold text-yellow-400">
                      {item.slot}
                    </td>
                    <td className="p-2 border border-gray-700 font-mono text-gray-400">
                      #{item.playerID}
                    </td>
                    <td className="p-2 border border-gray-700 text-red-300">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>
    </div>
  );
};
