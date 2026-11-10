import { useMemo, useState } from "react";
import { SimPHL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { ProfessionalPlayer, ProfessionalTeam } from "../../models/hockeyModels";

export const AdminPHLReportsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    phlTeams,
    phlTeamMap,
    hck_Timestamp,
    proRosterMap,
    capsheetMap,
    phlLineupsMap,
    phlShootoutLineupsMap,
    affiliatePlayers,
  } = useSimHCKStore();

  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const affiliateIDSet = useMemo(() => {
    return new Set((affiliatePlayers || []).map((p) => p.ID));
  }, [affiliatePlayers]);

  const isAffiliatePlayer = (p: ProfessionalPlayer): boolean => {
    return (
      Boolean(p.IsAffiliatePlayer) ||
      Boolean(p.AffiliateTeamID && p.AffiliateTeamID > 0) ||
      affiliateIDSet.has(p.ID)
    );
  };

  const leagueCap =
    hck_Timestamp?.Y1Capspace && hck_Timestamp.Y1Capspace > 0
      ? hck_Timestamp.Y1Capspace
      : 88; // Default $88M if not set

  // 1. Salary Cap Breaches
  const capBreaches = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      capLimit: number;
      totalCap: number;
      overage: number;
    }> = [];

    (phlTeams || []).forEach((team) => {
      const capsheet = capsheetMap?.[team.ID];
      let totalPayroll = Number(capsheet?.Y1CapHit ?? 0);

      // Fallback: calculate from player contracts if capsheet is 0
      if (totalPayroll === 0 && proRosterMap?.[team.ID]) {
        const roster = proRosterMap[team.ID] || [];
        totalPayroll = roster.reduce((sum, p) => {
          const c = p.Contract;
          const y1 = c?.Y1CapHit ?? c?.Y1Salary ?? 0;
          return sum + (Number(y1) || 0);
        }, 0);
      }

      const overage = totalPayroll - leagueCap;
      if (overage > 0.05) {
        list.push({
          teamID: team.ID,
          teamName: `${team.TeamName} ${team.Mascot}`,
          capLimit: leagueCap,
          totalCap: totalPayroll,
          overage: overage > 0 ? overage : 0,
        });
      }
    });

    return list.sort((a, b) => b.overage - a.overage);
  }, [phlTeams, capsheetMap, proRosterMap, leagueCap]);

  // 2. Roster Limit Breaches
  const rosterBreaches = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      activeCount: number;
      affiliateCount: number;
      goalieCount: number;
      totalCount: number;
      issue: string;
    }> = [];

    (phlTeams || []).forEach((team) => {
      const roster: ProfessionalPlayer[] = proRosterMap?.[team.ID] || [];
      const affiliate = roster.filter((p) => isAffiliatePlayer(p)).length;
      const active = roster.filter((p) => !isAffiliatePlayer(p)).length;
      const goalies = roster.filter((p) => !isAffiliatePlayer(p) && p.Position === "G").length;
      const issues: string[] = [];

      if (active > 23) {
        issues.push(`Over active roster limit (${active}/23)`);
      } else if (active < 20 && roster.length > 0) {
        issues.push(`Under active roster minimum (${active}/20)`);
      }

      if (goalies < 2 && roster.length > 0) {
        issues.push(`Fewer than 2 goalies on roster (${goalies}/2)`);
      }

      if (issues.length > 0) {
        list.push({
          teamID: team.ID,
          teamName: `${team.TeamName} ${team.Mascot}`,
          activeCount: active,
          affiliateCount: affiliate,
          goalieCount: goalies,
          totalCount: roster.length,
          issue: issues.join("; "),
        });
      }
    });

    return list.sort((a, b) => b.activeCount - a.activeCount);
  }, [phlTeams, proRosterMap, affiliateIDSet]);

  // 3. Injured Players on Active Lines / Shootout
  const injuredOnLines = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      slot: string;
      playerName: string;
      position: string;
      injuryType: string;
      daysOfRecovery: number;
    }> = [];

    (phlTeams || []).forEach((team) => {
      const teamRoster = proRosterMap?.[team.ID] || [];
      const playerMap = new Map<number, ProfessionalPlayer>();
      teamRoster.forEach((p) => playerMap.set(p.ID, p));

      const teamName = `${team.TeamName} ${team.Mascot}`;
      const lines = phlLineupsMap?.[team.ID] || [];

      // Check lines
      lines.forEach((l) => {
        const lineNum = l.Line || 1;
        const checkPos = (pid: number, posName: string) => {
          if (!pid || pid <= 0) return;
          const player = playerMap.get(pid);
          if (player && (player.IsInjured || (player.DaysOfRecovery ?? 0) > 0)) {
            list.push({
              teamID: team.ID,
              teamName,
              slot: `Line ${lineNum} - ${posName}`,
              playerName: `${player.FirstName} ${player.LastName}`,
              position: player.Position || posName,
              injuryType: player.InjuryType || "Injured",
              daysOfRecovery: player.DaysOfRecovery || 1,
            });
          }
        };

        checkPos(l.CenterID, "C");
        checkPos(l.Forward1ID, "LW");
        checkPos(l.Forward2ID, "RW");
        checkPos(l.Defender1ID, "LD");
        checkPos(l.Defender2ID, "RD");
        checkPos(l.GoalieID, "G");
      });

      // Check shootout lineup
      const so = phlShootoutLineupsMap?.[team.ID];
      if (so) {
        const checkShooter = (pid: number, slotName: string) => {
          if (!pid || pid <= 0) return;
          const player = playerMap.get(pid);
          if (player && (player.IsInjured || (player.DaysOfRecovery ?? 0) > 0)) {
            list.push({
              teamID: team.ID,
              teamName,
              slot: `Shootout ${slotName}`,
              playerName: `${player.FirstName} ${player.LastName}`,
              position: player.Position,
              injuryType: player.InjuryType || "Injured",
              daysOfRecovery: player.DaysOfRecovery || 1,
            });
          }
        };

        checkShooter(so.GoalieID, "Goalie");
        checkShooter(so.Shooter1ID, "#1");
        checkShooter(so.Shooter2ID, "#2");
        checkShooter(so.Shooter3ID, "#3");
        checkShooter(so.Shooter4ID, "#4");
        checkShooter(so.Shooter5ID, "#5");
        checkShooter(so.Shooter6ID, "#6");
      }
    });

    return list;
  }, [phlTeams, proRosterMap, phlLineupsMap, phlShootoutLineupsMap]);

  // 4. Missing / Invalid Line Slots
  const missingOnLines = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      slot: string;
      playerID: number;
      reason: string;
    }> = [];

    (phlTeams || []).forEach((team) => {
      const teamRoster = proRosterMap?.[team.ID] || [];
      const rosterIDs = new Set<number>(teamRoster.map((p) => p.ID));
      const teamName = `${team.TeamName} ${team.Mascot}`;

      const lines = phlLineupsMap?.[team.ID] || [];
      lines.forEach((l) => {
        const lineNum = l.Line || 1;
        const checkPos = (pid: number, posName: string) => {
          if (!pid || pid <= 0) return;
          if (!rosterIDs.has(pid)) {
            list.push({
              teamID: team.ID,
              teamName,
              slot: `Line ${lineNum} - ${posName}`,
              playerID: pid,
              reason: "Player ID no longer on active team roster (cut/traded)",
            });
          } else {
            const slottedPlayer = teamRoster.find((p) => p.ID === pid);
            if (slottedPlayer && isAffiliatePlayer(slottedPlayer)) {
              list.push({
                teamID: team.ID,
                teamName,
                slot: `Line ${lineNum} - ${posName}`,
                playerID: pid,
                reason: "Player is assigned to affiliate/minors and cannot dress on active lines",
              });
            }
          }
        };

        checkPos(l.CenterID, "C");
        checkPos(l.Forward1ID, "LW");
        checkPos(l.Forward2ID, "RW");
        checkPos(l.Defender1ID, "LD");
        checkPos(l.Defender2ID, "RD");
        checkPos(l.GoalieID, "G");
      });
    });

    return list;
  }, [phlTeams, proRosterMap, phlLineupsMap]);

  // Dropdown team filter
  const teamOptions = useMemo(() => {
    const list = (phlTeams || [])
      .map((t) => ({
        label: `${t.TeamName} ${t.Mascot}`,
        value: t.ID.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: "All Teams", value: "ALL" }, ...list];
  }, [phlTeams]);

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
  const filteredInjured = filterByTeamAndSearch(injuredOnLines);
  const filteredMissing = filterByTeamAndSearch(missingOnLines);

  return (
    <div className="flex flex-col gap-y-4 w-full p-2">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimPHL League Health & Violation Reports
          </Text>
          <Text variant="small" classes="text-gray-400">
            Automated monitoring of salary cap limits, roster sizes, and injured/invalid players on active lines and shootout rotations.
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
            Injured on Lines
          </Text>
          <Text variant="h5" classes="font-bold text-orange-400">
            {injuredOnLines.length}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-blue-400">
            Invalid Line Slots
          </Text>
          <Text variant="h5" classes="font-bold text-blue-400">
            {missingOnLines.length}
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
            placeholder="Search by team, player, line..."
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
            No salary cap breaches found. All PHL teams are within allowable cap space.
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
                          url={getLogo(SimPHL, b.teamID, currentUser?.IsRetro)}
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
              Teams violating the 23-player active limit, 20-player minimum, or 2-goalie minimum requirement.
            </Text>
          </div>
        </div>

        {filteredRosterBreaches.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No roster limit breaches found. All PHL teams meet roster requirements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700 text-center">Active Roster</th>
                  <th className="p-2 border border-gray-700 text-center">Minors / Affiliate</th>
                  <th className="p-2 border border-gray-700 text-center">Goalies</th>
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
                          url={getLogo(SimPHL, b.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{b.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono font-bold text-yellow-400">
                      {b.activeCount} / 23
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono text-gray-300">
                      {b.affiliateCount}
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono font-bold text-blue-400">
                      {b.goalieCount}
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

      {/* 3. Injured Players on Active Lines Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              3. Injured Players on Active Lines ({filteredInjured.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Line and shootout slots containing injured players who should be rested or replaced.
            </Text>
          </div>
        </div>

        {filteredInjured.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No injured players found on any active PHL lines or shootout rotations!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700">Line / Slot</th>
                  <th className="p-2 border border-gray-700">Player</th>
                  <th className="p-2 border border-gray-700">Position</th>
                  <th className="p-2 border border-gray-700">Injury Description</th>
                  <th className="p-2 border border-gray-700 text-center">Days Out</th>
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
                          url={getLogo(SimPHL, item.teamID, currentUser?.IsRetro)}
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
                      {item.daysOfRecovery} day{item.daysOfRecovery === 1 ? "" : "s"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>

      {/* 4. Missing / Invalid Line Slots Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              4. Line Roster Violations ({filteredMissing.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Line slots containing player IDs that are no longer on the active team roster (cut/traded).
            </Text>
          </div>
        </div>

        {filteredMissing.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No line roster violations found. All slotted players are on active rosters.
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
                          url={getLogo(SimPHL, item.teamID, currentUser?.IsRetro)}
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
