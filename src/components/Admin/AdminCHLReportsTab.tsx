import { useMemo, useState } from "react";
import { SimCHL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import {
  CollegeLineup,
  CollegePlayer,
  CollegeTeam,
} from "../../models/hockeyModels";

const getCHLTeamName = (t?: CollegeTeam | null): string => {
  if (!t) return "";
  return t.Mascot ? `${t.TeamName} ${t.Mascot}` : t.TeamName;
};

export const AdminCHLReportsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    chlTeams,
    chlTeamMap,
    chlRosterMap,
    chlLineupsMap,
    chlShootoutLineupsMap,
    chlConferenceOptions,
  } = useSimHCKStore();

  const [selectedConf, setSelectedConf] = useState<string>("ALL");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1. Roster Limit Breaches
  const rosterBreaches = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      conference: string;
      totalCount: number;
      activeCount: number;
      redshirtCount: number;
      goalieCount: number;
      issue: string;
    }> = [];

    (chlTeams || []).forEach((team) => {
      const roster: CollegePlayer[] = chlRosterMap?.[team.ID] || [];
      const redshirts = roster.filter(
        (p) => Boolean(p.IsRedshirt) || Boolean(p.IsRedshirting),
      ).length;
      const active = roster.length - redshirts;
      const activeGoalies = roster.filter(
        (p) =>
          p.Position === "G" &&
          !Boolean(p.IsRedshirt) &&
          !Boolean(p.IsRedshirting),
      ).length;

      const issues: string[] = [];

      if (roster.length > 30) {
        issues.push(`Over max roster limit (${roster.length}/30)`);
      } else if (active < 20 && roster.length > 0) {
        issues.push(`Under minimum active lineup requirement (${active}/20)`);
      }

      if (activeGoalies < 2 && roster.length > 0) {
        issues.push(`Fewer than 2 active goalies (${activeGoalies}/2)`);
      }

      if (issues.length > 0) {
        list.push({
          teamID: team.ID,
          teamName: getCHLTeamName(team),
          conference: team.Conference || "Independent",
          totalCount: roster.length,
          activeCount: active,
          redshirtCount: redshirts,
          goalieCount: activeGoalies,
          issue: issues.join("; "),
        });
      }
    });

    return list.sort((a, b) => b.totalCount - a.totalCount);
  }, [chlTeams, chlRosterMap]);

  // 2. Injured Players on Active Lines & Shootout
  const injuredOnLines = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      conference: string;
      slot: string;
      playerName: string;
      position: string;
      injuryType: string;
      daysOfRecovery: number;
    }> = [];

    (chlTeams || []).forEach((team) => {
      const teamRoster = chlRosterMap?.[team.ID] || [];
      const playerMap = new Map<number, CollegePlayer>();
      teamRoster.forEach((p) => playerMap.set(p.ID, p));

      const teamName = getCHLTeamName(team);
      const conf = team.Conference || "Independent";
      const lines = chlLineupsMap?.[team.ID] || [];

      // Check standard 4 lines
      lines.forEach((l) => {
        const lineNum = l.Line || 1;
        const checkPos = (pid: number, posName: string) => {
          if (!pid || pid <= 0) return;
          const player = playerMap.get(pid);
          if (player && (player.IsInjured || (player.DaysOfRecovery ?? 0) > 0)) {
            list.push({
              teamID: team.ID,
              teamName,
              conference: conf,
              slot: `Line ${lineNum} - ${posName}`,
              playerName: `${player.FirstName} ${player.LastName}`,
              position: player.Position || posName,
              injuryType: player.InjuryType || player.InjuryName || "Injured",
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
      const so = chlShootoutLineupsMap?.[team.ID];
      if (so) {
        const checkShooter = (pid: number, slotName: string) => {
          if (!pid || pid <= 0) return;
          const player = playerMap.get(pid);
          if (player && (player.IsInjured || (player.DaysOfRecovery ?? 0) > 0)) {
            list.push({
              teamID: team.ID,
              teamName,
              conference: conf,
              slot: `Shootout ${slotName}`,
              playerName: `${player.FirstName} ${player.LastName}`,
              position: player.Position,
              injuryType: player.InjuryType || player.InjuryName || "Injured",
              daysOfRecovery: player.DaysOfRecovery || 1,
            });
          }
        };

        checkShooter(so.Shooter1ID, "#1");
        checkShooter(so.Shooter2ID, "#2");
        checkShooter(so.Shooter3ID, "#3");
        checkShooter(so.Shooter4ID, "#4");
        checkShooter(so.Shooter5ID, "#5");
        checkShooter(so.Shooter6ID, "#6");
      }
    });

    return list;
  }, [chlTeams, chlRosterMap, chlLineupsMap, chlShootoutLineupsMap]);

  // 3. Redshirted Players on Active Lines (Eligibility Violation)
  const redshirtsOnLines = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      conference: string;
      slot: string;
      playerName: string;
      position: string;
      details: string;
    }> = [];

    (chlTeams || []).forEach((team) => {
      const teamRoster = chlRosterMap?.[team.ID] || [];
      const playerMap = new Map<number, CollegePlayer>();
      teamRoster.forEach((p) => playerMap.set(p.ID, p));

      const teamName = getCHLTeamName(team);
      const conf = team.Conference || "Independent";
      const lines = chlLineupsMap?.[team.ID] || [];

      lines.forEach((l) => {
        const lineNum = l.Line || 1;
        const checkRedshirt = (pid: number, posName: string) => {
          if (!pid || pid <= 0) return;
          const player = playerMap.get(pid);
          if (player && (player.IsRedshirt || player.IsRedshirting)) {
            list.push({
              teamID: team.ID,
              teamName,
              conference: conf,
              slot: `Line ${lineNum} - ${posName}`,
              playerName: `${player.FirstName} ${player.LastName}`,
              position: player.Position || posName,
              details: "Player is currently taking a redshirt season and cannot dress in active lines",
            });
          }
        };

        checkRedshirt(l.CenterID, "C");
        checkRedshirt(l.Forward1ID, "LW");
        checkRedshirt(l.Forward2ID, "RW");
        checkRedshirt(l.Defender1ID, "LD");
        checkRedshirt(l.Defender2ID, "RD");
        checkRedshirt(l.GoalieID, "G");
      });
    });

    return list;
  }, [chlTeams, chlRosterMap, chlLineupsMap]);

  // 4. Missing / Invalid Line Slots (Player not on roster)
  const missingOnLines = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      conference: string;
      slot: string;
      playerID: number;
      reason: string;
    }> = [];

    (chlTeams || []).forEach((team) => {
      const teamRoster = chlRosterMap?.[team.ID] || [];
      const rosterIDs = new Set<number>(teamRoster.map((p) => p.ID));
      const teamName = getCHLTeamName(team);
      const conf = team.Conference || "Independent";

      const lines = chlLineupsMap?.[team.ID] || [];
      lines.forEach((l) => {
        const lineNum = l.Line || 1;
        const checkPos = (pid: number, posName: string) => {
          if (!pid || pid <= 0) return;
          if (!rosterIDs.has(pid)) {
            list.push({
              teamID: team.ID,
              teamName,
              conference: conf,
              slot: `Line ${lineNum} - ${posName}`,
              playerID: pid,
              reason: "Player ID is no longer on team roster (transferred or removed)",
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
    });

    return list;
  }, [chlTeams, chlRosterMap, chlLineupsMap]);

  // Conferences options
  const conferenceOptions = useMemo(() => {
    if (chlConferenceOptions && chlConferenceOptions.length > 0) {
      return [{ label: "All Conferences", value: "ALL" }, ...chlConferenceOptions.filter((c) => c.value !== "ALL")];
    }
    const set = new Set<string>();
    (chlTeams || []).forEach((t) => {
      if (t.Conference) set.add(t.Conference);
    });
    return [
      { label: "All Conferences", value: "ALL" },
      ...Array.from(set).sort().map((c) => ({ label: c, value: c })),
    ];
  }, [chlConferenceOptions, chlTeams]);

  // Team dropdown filter
  const teamOptions = useMemo(() => {
    let list = (chlTeams || []);
    if (selectedConf !== "ALL") {
      list = list.filter((t) => t.Conference === selectedConf);
    }
    const mapped = list
      .map((t) => ({
        label: `${getCHLTeamName(t)} [${t.Abbreviation}]`,
        value: t.ID.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: "All Teams", value: "ALL" }, ...mapped];
  }, [chlTeams, selectedConf]);

  // Filtering helper
  const filterItems = <T extends { teamID: number; teamName: string; conference?: string }>(
    items: T[],
  ): T[] => {
    return items.filter((item) => {
      if (selectedConf !== "ALL" && item.conference !== selectedConf) {
        return false;
      }
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

  const filteredRosterBreaches = filterItems(rosterBreaches);
  const filteredInjured = filterItems(injuredOnLines);
  const filteredRedshirts = filterItems(redshirtsOnLines);
  const filteredMissing = filterItems(missingOnLines);

  return (
    <div className="flex flex-col gap-y-4 w-full p-2">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimCHL College Hockey Health & Violation Reports
          </Text>
          <Text variant="small" classes="text-gray-400">
            Automated monitoring of roster sizes, injured players on lines, redshirt eligibility, and invalid lineup slots across college hockey.
          </Text>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <Text variant="small" classes="text-red-400">
            Redshirts on Lines
          </Text>
          <Text variant="h5" classes="font-bold text-red-400">
            {redshirtsOnLines.length}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto flex-1">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Conference</span>
            <SelectDropdown
              options={conferenceOptions}
              value={{
                label:
                  conferenceOptions.find((o) => o.value === selectedConf)?.label ||
                  selectedConf,
                value: selectedConf,
              }}
              onChange={(opt) => {
                if (opt) {
                  setSelectedConf(opt.value);
                  setSelectedTeam("ALL");
                }
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Team</span>
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

      {/* 1. Roster Breaches Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              1. Roster Limit Breaches ({filteredRosterBreaches.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Teams exceeding the 30-player roster cap, below the 20 active player minimum, or with fewer than 2 active goalies.
            </Text>
          </div>
        </div>

        {filteredRosterBreaches.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No roster limit breaches found. All CHL teams meet college hockey roster requirements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700">Conference</th>
                  <th className="p-2 border border-gray-700 text-center">Total Roster</th>
                  <th className="p-2 border border-gray-700 text-center">Active (Non-RS)</th>
                  <th className="p-2 border border-gray-700 text-center">Redshirts</th>
                  <th className="p-2 border border-gray-700 text-center">Active Goalies</th>
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
                          url={getLogo(SimCHL, b.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{b.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 text-xs text-gray-400">
                      {b.conference}
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono font-bold text-yellow-400">
                      {b.totalCount} / 30
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono text-gray-200">
                      {b.activeCount}
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono text-gray-400">
                      {b.redshirtCount}
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

      {/* 2. Injured Players on Active Lines Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              2. Injured Players on Active Lines ({filteredInjured.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Line and shootout slots containing injured players who should be rested or replaced.
            </Text>
          </div>
        </div>

        {filteredInjured.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No injured players found on any active CHL lines or shootout rotations!
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
                          url={getLogo(SimCHL, item.teamID, currentUser?.IsRetro)}
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

      {/* 3. Redshirted Players on Active Lines Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              3. Redshirt Eligibility Violations ({filteredRedshirts.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Active lines containing players who are designated as redshirts for the current season.
            </Text>
          </div>
        </div>

        {filteredRedshirts.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No redshirt eligibility violations found. All redshirts are correctly withheld from active lines.
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
                  <th className="p-2 border border-gray-700">Violation Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredRedshirts.map((item, idx) => (
                  <tr
                    key={`rs-${idx}`}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="p-2 border border-gray-700 font-semibold text-white">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(SimCHL, item.teamID, currentUser?.IsRetro)}
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
                    <td className="p-2 border border-gray-700 text-red-300 font-medium">
                      {item.details}
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
              Line slots containing player IDs that are no longer on the active team roster (transferred or removed).
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
                          url={getLogo(SimCHL, item.teamID, currentUser?.IsRetro)}
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
