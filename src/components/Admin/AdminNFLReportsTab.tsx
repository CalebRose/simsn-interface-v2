import { useEffect, useMemo, useState } from "react";
import { SimNFL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { DepthChartService } from "../../_services/depthChartService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import {
  NFLDepthChart,
  NFLDepthChartPosition,
  NFLPlayer,
} from "../../models/footballModels";

const SPECIAL_TEAMS_POSITIONS = new Set(["K", "P", "PR", "KR", "FG", "STU"]);

const POSITION_COMPATIBILITY: Record<string, string[]> = {
  QB: ["QB"],
  RB: ["RB", "FB"],
  FB: ["FB", "RB", "TE"],
  WR: ["WR", "TE", "RB"],
  TE: ["TE", "FB", "WR"],
  OT: ["OT", "OG", "C"],
  OG: ["OG", "C", "OT"],
  C: ["C", "OG", "OT"],
  DE: ["DE", "DT", "OLB"],
  DT: ["DT", "DE"],
  OLB: ["OLB", "ILB", "DE"],
  ILB: ["ILB", "OLB"],
  CB: ["CB", "FS", "SS"],
  FS: ["FS", "SS", "CB"],
  SS: ["SS", "FS", "CB"],
  K: ["K", "P"],
  P: ["P", "K"],
  PR: ["WR", "RB", "CB", "FS"],
  KR: ["WR", "RB", "CB", "FS"],
  FG: ["K", "P"],
  STU: ["SS", "FS", "CB", "RB", "WR", "OLB"],
};

function scorePlayerForNFLPosition(p: NFLPlayer, targetPosition: string): number {
  const ovr = p.Overall || 0;
  const pos = p.Position;
  if (pos === targetPosition) return ovr + 100;

  switch (targetPosition) {
    case "PR":
    case "KR": {
      let s = (p.Speed || 0) + Math.floor(ovr * 0.2);
      if (pos === "WR" || pos === "RB" || pos === "CB") s += 25;
      return s;
    }
    case "STU": {
      let s = (p.Tackle || 0) + Math.floor(ovr * 0.2);
      return s;
    }
    case "FG": {
      return pos === "K" ? ovr + 100 : pos === "P" ? ovr + 50 : 0;
    }
    default:
      return ovr;
  }
}

function autoFixNFLDepthChart(
  dc: NFLDepthChart,
  roster: NFLPlayer[],
): { updatedDC: NFLDepthChart; fixedSlotsCount: number } {
  const playerByID = new Map<number, NFLPlayer>();
  roster.forEach((p) => playerByID.set(p.ID, p));

  const healthyActiveRoster = roster.filter(
    (p) =>
      p.ID > 0 &&
      !p.IsInjured &&
      !p.InjuryReserve &&
      !p.IsPracticeSquad &&
      (p.WeeksOfRecovery ?? 0) === 0,
  );

  const usedInPosition = new Map<string, Set<number>>();
  const usedInOffDef = new Set<number>();
  const usedAsFirstString = new Set<number>();

  const originalSlots = dc.DepthChartPlayers || [];
  const slotValidFlags = new Array<boolean>(originalSlots.length).fill(false);

  // Pass 1: Mark valid slots
  originalSlots.forEach((slot, idx) => {
    const pid = Number(slot.PlayerID);
    const pos = slot.Position;
    const isST = SPECIAL_TEAMS_POSITIONS.has(pos);
    const isFirstString = String(slot.PositionLevel) === "1";
    const rosterPlayer = playerByID.get(pid);

    if (!usedInPosition.has(pos)) {
      usedInPosition.set(pos, new Set<number>());
    }
    const posSet = usedInPosition.get(pos)!;

    const isValid =
      Boolean(pid && rosterPlayer && rosterPlayer.ID > 0) &&
      !rosterPlayer!.IsInjured &&
      !rosterPlayer!.InjuryReserve &&
      !rosterPlayer!.IsPracticeSquad &&
      (rosterPlayer!.WeeksOfRecovery ?? 0) === 0 &&
      !posSet.has(pid) &&
      !(isFirstString && !isST && usedAsFirstString.has(pid));

    if (isValid) {
      slotValidFlags[idx] = true;
      posSet.add(pid);
      if (!isST) {
        usedInOffDef.add(pid);
        if (isFirstString) {
          usedAsFirstString.add(pid);
        }
      }
    }
  });

  // Pass 2: Replace invalid slots with best available player without duplicates
  let fixedSlotsCount = 0;
  const updatedPlayers: NFLDepthChartPosition[] = originalSlots.map(
    (slot, idx) => {
      if (slotValidFlags[idx]) {
        const existingPlayer = playerByID.get(Number(slot.PlayerID));
        return existingPlayer
          ? new NFLDepthChartPosition({
              ...slot,
              FirstName: existingPlayer.FirstName,
              LastName: existingPlayer.LastName,
              OriginalPosition: existingPlayer.Position,
            })
          : slot;
      }

      const targetPos = slot.Position;
      const isST = SPECIAL_TEAMS_POSITIONS.has(targetPos);
      const isFirstString = String(slot.PositionLevel) === "1";

      if (!usedInPosition.has(targetPos)) {
        usedInPosition.set(targetPos, new Set<number>());
      }
      const posSet = usedInPosition.get(targetPos)!;

      const candidates = healthyActiveRoster.filter((p) => {
        if (posSet.has(p.ID)) return false;
        if (!isST && isFirstString && usedAsFirstString.has(p.ID)) return false;
        return true;
      });

      const allowedPositions = POSITION_COMPATIBILITY[targetPos] || [targetPos];

      const scored = candidates.map((p) => {
        let baseScore = scorePlayerForNFLPosition(p, targetPos);
        const posRank = allowedPositions.indexOf(p.Position);
        if (posRank === 0) {
          baseScore += 500;
        } else if (posRank > 0) {
          baseScore += 250 - posRank * 40;
        } else {
          baseScore -= 200;
        }
        if (!isST && usedInOffDef.has(p.ID)) {
          baseScore -= 60;
        }
        return { player: p, score: baseScore };
      });

      scored.sort((a, b) => b.score - a.score);

      const replacement = scored[0]?.player;

      if (replacement) {
        fixedSlotsCount++;
        posSet.add(replacement.ID);
        if (!isST) {
          usedInOffDef.add(replacement.ID);
          if (isFirstString) {
            usedAsFirstString.add(replacement.ID);
          }
        }
        return new NFLDepthChartPosition({
          ...slot,
          PlayerID: replacement.ID,
          FirstName: replacement.FirstName,
          LastName: replacement.LastName,
          OriginalPosition: replacement.Position,
        });
      }

      return slot;
    },
  );

  return {
    updatedDC: new NFLDepthChart({
      ...dc,
      DepthChartPlayers: updatedPlayers,
    }),
    fixedSlotsCount,
  };
}

export const AdminNFLReportsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    proTeamMap,
    proRosterMap,
    nflPlayerMap,
    nflDepthChartMap,
    capsheetMap,
    cfb_Timestamp,
    updateNFLDepthChartMap,
    getBootstrapPlayerData,
    getBootstrapGameplanData,
  } = useSimFBAStore();

  // Ensure pro roster and depth chart data are loaded
  useEffect(() => {
    if (!proRosterMap || Object.keys(proRosterMap).length === 0) {
      getBootstrapPlayerData();
    }
    if (!nflDepthChartMap || Object.keys(nflDepthChartMap).length === 0) {
      getBootstrapGameplanData();
    }
  }, [proRosterMap, nflDepthChartMap, getBootstrapPlayerData, getBootstrapGameplanData]);

  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("ALL");
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [fixSuccessMsg, setFixSuccessMsg] = useState<string | null>(null);

  const yearlyCap = cfb_Timestamp?.Y1Capspace ?? 0;

  // 1. Salary Cap Breaches
  const capBreaches = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      teamAbbr: string;
      totalCapHit: number;
      capLimit: number;
      capOverage: number;
    }> = [];

    if (!capsheetMap) return list;

    Object.entries(capsheetMap).forEach(([teamIDStr, sheet]) => {
      const teamID = Number(teamIDStr);
      const team = proTeamMap?.[teamID];
      const Y1Bonus = sheet?.Y1Bonus || 0;
      const Y1Salary = sheet?.Y1Salary || 0;
      const Y1CapHit = sheet?.Y1CapHit || 0;
      const totalCapHit = Y1Bonus + Y1Salary + Y1CapHit;
      const limit = yearlyCap > 0 ? yearlyCap : 255;

      if (totalCapHit > limit) {
        list.push({
          teamID,
          teamName: team ? `${team.TeamName} ${team.Mascot}` : `Team #${teamID}`,
          teamAbbr: team?.TeamAbbr || "NFL",
          totalCapHit,
          capLimit: limit,
          capOverage: totalCapHit - limit,
        });
      }
    });

    return list.sort((a, b) => b.capOverage - a.capOverage);
  }, [capsheetMap, proTeamMap, yearlyCap]);

  // 2. Roster Limit Breaches
  const rosterBreaches = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      teamAbbr: string;
      activeCount: number;
      psCount: number;
      irCount: number;
      issue: string;
    }> = [];

    if (!proRosterMap) return list;

    Object.entries(proRosterMap).forEach(([teamIDStr, roster]) => {
      const teamID = Number(teamIDStr);
      const team = proTeamMap?.[teamID];
      const total = roster?.length || 0;
      const ps = roster?.filter((p) => p?.IsPracticeSquad).length || 0;
      const ir = roster?.filter((p) => p?.InjuryReserve).length || 0;
      const active = total - ps - ir;

      const issues: string[] = [];
      if (active > 53) {
        issues.push(`Active roster over limit (${active}/53)`);
      } else if (active < 53) {
        issues.push(`Active roster under limit (${active}/53)`);
      }
      if (ps > 16) {
        issues.push(`Practice squad over limit (${ps}/16)`);
      }

      if (issues.length > 0) {
        list.push({
          teamID,
          teamName: team ? `${team.TeamName} ${team.Mascot}` : `Team #${teamID}`,
          teamAbbr: team?.TeamAbbr || "NFL",
          activeCount: active,
          psCount: ps,
          irCount: ir,
          issue: issues.join(", "),
        });
      }
    });

    return list.sort((a, b) => b.activeCount - a.activeCount);
  }, [proRosterMap, proTeamMap]);

  // 3. Injured Players on Depth Chart
  const injuredOnDepthChart = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      teamAbbr: string;
      slot: string;
      playerName: string;
      position: string;
      injuryType: string;
      weeksOfRecovery: number;
    }> = [];

    if (!nflDepthChartMap || !proRosterMap) return list;

    Object.entries(nflDepthChartMap).forEach(([teamIDStr, dc]) => {
      const teamID = Number(teamIDStr);
      const team = proTeamMap?.[teamID];
      const roster = proRosterMap[teamID] || [];
      const rosterMap = new Map(roster.map((p) => [p.ID, p]));

      (dc?.DepthChartPlayers || []).forEach((slot) => {
        const player =
          rosterMap.get(Number(slot.PlayerID)) ||
          nflPlayerMap?.[Number(slot.PlayerID)];

        if (player && (player.IsInjured || (player.WeeksOfRecovery ?? 0) > 0)) {
          list.push({
            teamID,
            teamName: team ? `${team.TeamName} ${team.Mascot}` : `Team #${teamID}`,
            teamAbbr: team?.TeamAbbr || "NFL",
            slot: `${slot.Position}${slot.PositionLevel || ""}`,
            playerName: `${player.FirstName} ${player.LastName}`,
            position: player.Position,
            injuryType: player.InjuryType || "Injured",
            weeksOfRecovery: player.WeeksOfRecovery || 0,
          });
        }
      });
    });

    return list.sort((a, b) => a.teamName.localeCompare(b.teamName));
  }, [nflDepthChartMap, proRosterMap, nflPlayerMap, proTeamMap]);

  // 4. Players No Longer on Team on Depth Chart
  const missingOnDepthChart = useMemo(() => {
    const list: Array<{
      teamID: number;
      teamName: string;
      teamAbbr: string;
      slot: string;
      playerID: number;
      playerName: string;
      issue: string;
    }> = [];

    if (!nflDepthChartMap || !proRosterMap) return list;

    Object.entries(nflDepthChartMap).forEach(([teamIDStr, dc]) => {
      const teamID = Number(teamIDStr);
      const team = proTeamMap?.[teamID];
      const roster = proRosterMap[teamID] || [];
      const rosterIDs = new Set(roster.map((p) => p.ID));
      const rosterMap = new Map(roster.map((p) => [p.ID, p]));

      (dc?.DepthChartPlayers || []).forEach((slot) => {
        const pid = Number(slot.PlayerID);
        if (!pid || pid === 0) return;

        if (!rosterIDs.has(pid)) {
          const extPlayer = nflPlayerMap?.[pid];
          list.push({
            teamID,
            teamName: team ? `${team.TeamName} ${team.Mascot}` : `Team #${teamID}`,
            teamAbbr: team?.TeamAbbr || "NFL",
            slot: `${slot.Position}${slot.PositionLevel || ""}`,
            playerID: pid,
            playerName: extPlayer
              ? `${extPlayer.FirstName} ${extPlayer.LastName}`
              : slot.FirstName && slot.LastName
              ? `${slot.FirstName} ${slot.LastName}`
              : `Player #${pid}`,
            issue: "No longer on team roster (traded/cut)",
          });
        } else {
          const rp = rosterMap.get(pid);
          if (rp?.IsPracticeSquad) {
            list.push({
              teamID,
              teamName: team ? `${team.TeamName} ${team.Mascot}` : `Team #${teamID}`,
              teamAbbr: team?.TeamAbbr || "NFL",
              slot: `${slot.Position}${slot.PositionLevel || ""}`,
              playerID: pid,
              playerName: `${rp.FirstName} ${rp.LastName}`,
              issue: "Assigned to Practice Squad",
            });
          }
        }
      });
    });

    return list.sort((a, b) => a.teamName.localeCompare(b.teamName));
  }, [nflDepthChartMap, proRosterMap, nflPlayerMap, proTeamMap]);

  // Teams affected by depth chart errors
  const depthChartErrorTeams = useMemo(() => {
    const teams = new Set<number>();
    injuredOnDepthChart.forEach((e) => teams.add(e.teamID));
    missingOnDepthChart.forEach((e) => teams.add(e.teamID));
    return teams;
  }, [injuredOnDepthChart, missingOnDepthChart]);

  // AUTO FIX ALL ERRORS Handler
  const handleAutoFixAll = async () => {
    if (depthChartErrorTeams.size === 0) {
      alert("No depth chart errors detected to fix!");
      return;
    }

    if (
      !window.confirm(
        `Auto-fix depth chart errors for all ${depthChartErrorTeams.size} affected teams? This will replace injured, missing, or practice squad players with the best next available healthy active roster players.`,
      )
    ) {
      return;
    }

    setIsFixing(true);
    setFixSuccessMsg(null);

    try {
      const nextDCMap = { ...(nflDepthChartMap || {}) };
      let totalSlotsFixed = 0;
      let teamsFixed = 0;

      for (const teamID of depthChartErrorTeams) {
        const dc = nextDCMap[teamID];
        const roster = proRosterMap?.[teamID];
        if (!dc || !roster) continue;

        const { updatedDC, fixedSlotsCount } = autoFixNFLDepthChart(dc, roster);
        if (fixedSlotsCount > 0) {
          await DepthChartService.SaveNFLDepthChart(updatedDC);
          nextDCMap[teamID] = updatedDC;
          totalSlotsFixed += fixedSlotsCount;
          teamsFixed++;
        }
      }

      updateNFLDepthChartMap(nextDCMap);
      setFixSuccessMsg(
        `Successfully auto-fixed ${totalSlotsFixed} depth chart slot(s) across ${teamsFixed} team(s)!`,
      );
    } catch (err: any) {
      alert(`Auto-fix error: ${err?.message || "Failed to update depth charts."}`);
    } finally {
      setIsFixing(false);
    }
  };

  // Team options for filtering
  const teamOptions = useMemo(() => {
    const list = Object.values(proTeamMap || {})
      .sort((a, b) => a.TeamName.localeCompare(b.TeamName))
      .map((t) => ({
        label: `${t.TeamName} ${t.Mascot}`,
        value: t.ID.toString(),
      }));
    return [{ label: "All Teams", value: "ALL" }, ...list];
  }, [proTeamMap]);

  const filteredCapBreaches = useMemo(() => {
    if (selectedTeamFilter === "ALL") return capBreaches;
    return capBreaches.filter((b) => b.teamID === Number(selectedTeamFilter));
  }, [capBreaches, selectedTeamFilter]);

  const filteredRosterBreaches = useMemo(() => {
    if (selectedTeamFilter === "ALL") return rosterBreaches;
    return rosterBreaches.filter((b) => b.teamID === Number(selectedTeamFilter));
  }, [rosterBreaches, selectedTeamFilter]);

  const filteredInjured = useMemo(() => {
    if (selectedTeamFilter === "ALL") return injuredOnDepthChart;
    return injuredOnDepthChart.filter((b) => b.teamID === Number(selectedTeamFilter));
  }, [injuredOnDepthChart, selectedTeamFilter]);

  const filteredMissing = useMemo(() => {
    if (selectedTeamFilter === "ALL") return missingOnDepthChart;
    return missingOnDepthChart.filter((b) => b.teamID === Number(selectedTeamFilter));
  }, [missingOnDepthChart, selectedTeamFilter]);

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        <div className="p-4 rounded-xl bg-gray-900/60 border border-red-800/60 flex flex-col items-center">
          <Text variant="small" classes="text-red-300 font-bold uppercase text-xs">
            Salary Cap Breaches
          </Text>
          <span className="text-3xl font-mono font-extrabold text-red-400">
            {capBreaches.length}
          </span>
          <Text variant="small" classes="text-gray-400 text-xs mt-1">
            Teams exceeding cap limit
          </Text>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-yellow-800/60 flex flex-col items-center">
          <Text variant="small" classes="text-yellow-300 font-bold uppercase text-xs">
            Roster Limit Breaches
          </Text>
          <span className="text-3xl font-mono font-extrabold text-yellow-400">
            {rosterBreaches.length}
          </span>
          <Text variant="small" classes="text-gray-400 text-xs mt-1">
            Active != 53 or PS &gt; 16
          </Text>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-orange-800/60 flex flex-col items-center">
          <Text variant="small" classes="text-orange-300 font-bold uppercase text-xs">
            Injured on Depth Chart
          </Text>
          <span className="text-3xl font-mono font-extrabold text-orange-400">
            {injuredOnDepthChart.length}
          </span>
          <Text variant="small" classes="text-gray-400 text-xs mt-1">
            Slots requiring substitution
          </Text>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-purple-800/60 flex flex-col items-center">
          <Text variant="small" classes="text-purple-300 font-bold uppercase text-xs">
            DC Roster Violations
          </Text>
          <span className="text-3xl font-mono font-extrabold text-purple-400">
            {missingOnDepthChart.length}
          </span>
          <Text variant="small" classes="text-gray-400 text-xs mt-1">
            Traded/Cut or on PS in DC
          </Text>
        </div>
      </div>

      {/* AUTO FIX ALL ERRORS Action & Team Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center gap-x-4">
          <Button
            variant="danger"
            onClick={handleAutoFixAll}
            disabled={isFixing || depthChartErrorTeams.size === 0}
          >
            {isFixing
              ? "FIXING DEPTH CHARTS..."
              : `AUTO FIX ALL DEPTH CHART ERRORS (${depthChartErrorTeams.size} TEAMS)`}
          </Button>
          <span className="text-xs text-gray-400">
            Substitutes injured and invalid depth chart players with best available active players.
          </span>
        </div>

        <div className="w-64">
          <SelectDropdown
            options={teamOptions}
            value={teamOptions.find((o) => o.value === selectedTeamFilter) || null}
            onChange={(opt) => setSelectedTeamFilter(opt?.value ?? "ALL")}
            placeholder="Filter by Team"
          />
        </div>
      </div>

      {fixSuccessMsg && (
        <div className="p-3 rounded-lg bg-green-900/50 border border-green-500 text-green-300 font-semibold text-sm">
          {fixSuccessMsg}
        </div>
      )}

      {/* 1. Salary Cap Breaches Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              1. Salary Cap Breaches ({filteredCapBreaches.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Teams whose total payroll exceeds the league salary cap ($
              {yearlyCap > 0 ? yearlyCap.toFixed(2) : "0"}M).
            </Text>
          </div>
        </div>

        {filteredCapBreaches.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No salary cap breaches found. All teams are within allowable cap space limits.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700 text-right">Cap Limit</th>
                  <th className="p-2 border border-gray-700 text-right">Total Cap Hit</th>
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
                          url={getLogo(SimNFL, b.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{b.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono text-gray-300">
                      ${b.capLimit.toFixed(2)}M
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono text-yellow-400">
                      ${b.totalCapHit.toFixed(2)}M
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono font-bold text-red-400">
                      +${b.capOverage.toFixed(2)}M OVER
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
              Teams with active rosters not equal to 53 players or practice squad &gt; 16 players.
            </Text>
          </div>
        </div>

        {filteredRosterBreaches.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No roster limit breaches found. All teams meet roster requirements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700 text-center">Active Roster</th>
                  <th className="p-2 border border-gray-700 text-center">Practice Squad</th>
                  <th className="p-2 border border-gray-700 text-center">Injured Reserve</th>
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
                          url={getLogo(SimNFL, b.teamID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                        <span>{b.teamName}</span>
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono font-bold text-red-400">
                      {b.activeCount} / 53
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono text-gray-300">
                      {b.psCount} / 16
                    </td>
                    <td className="p-2 border border-gray-700 text-center font-mono text-gray-400">
                      {b.irCount}
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

      {/* 3. Injured Players on Depth Chart Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              3. Injured Players on Depth Chart ({filteredInjured.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Depth chart slots containing injured players who cannot participate in games.
            </Text>
          </div>
        </div>

        {filteredInjured.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No injured players found on active depth charts!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700">Slot</th>
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
                          url={getLogo(SimNFL, item.teamID, currentUser?.IsRetro)}
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

      {/* 4. Players No Longer on Team on Depth Chart Section */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              4. Depth Chart Roster Violations ({filteredMissing.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Depth chart slots containing players who have been traded, cut, or moved to Practice Squad.
            </Text>
          </div>
        </div>

        {filteredMissing.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            No roster violations found on active depth charts.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-2 border border-gray-700">Team</th>
                  <th className="p-2 border border-gray-700">Slot</th>
                  <th className="p-2 border border-gray-700">Player</th>
                  <th className="p-2 border border-gray-700">Violation Issue</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissing.map((item, idx) => (
                  <tr
                    key={`miss-${idx}`}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="p-2 border border-gray-700 font-semibold text-white">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(SimNFL, item.teamID, currentUser?.IsRetro)}
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
                    <td className="p-2 border border-gray-700 text-red-400 font-medium">
                      {item.issue}
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
