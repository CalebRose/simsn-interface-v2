import { useEffect, useMemo, useState } from "react";
import { SimCFB } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { DepthChartService } from "../../_services/depthChartService";
import { getLogo } from "../../_utility/getLogo";
import { POSITION_ELIGIBILITY } from "../Gameplan/FootballGameplan/Constants/DepthChartConstants";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import {
  CollegeDepthChartPosition,
  CollegePlayer,
  CollegeTeam,
  CollegeTeamDepthChart,
} from "../../models/footballModels";

const SPECIAL_TEAMS_POSITIONS = new Set(["P", "K", "FG", "PR", "KR", "STU"]);

function scorePlayerForDCPosition(
  p: CollegePlayer,
  dcPos: string,
): number {
  const pos = p.Position;
  const arch = p.Archetype;
  const ovr = p.Overall || 0;

  switch (dcPos) {
    case "QB": {
      let s = ovr;
      if (pos === "QB") s += 100;
      else if (pos === "ATH" && ["Triple-Threat", "Field General"].includes(arch))
        s += 50;
      return s;
    }
    case "RB": {
      let s = Math.floor(
        ((p.Speed || 0) + (p.Agility || 0) + (p.Strength || 0) + (p.Carrying || 0)) / 4 +
          ovr * 0.25,
      );
      if (pos === "RB") s += 100;
      else if (
        pos === "ATH" &&
        ["Wingback", "Soccer Player", "Triple-Threat"].includes(arch)
      )
        s += 50;
      else if (pos === "FB") s += 25;
      return s;
    }
    case "FB": {
      let s = Math.floor(
        ((p.Strength || 0) +
          (p.Carrying || 0) +
          (p.PassBlock || 0) +
          (p.RunBlock || 0)) /
          4 +
          ovr * 0.25,
      );
      if (pos === "FB") s += 100;
      else if (pos === "ATH" && arch === "Wingback") s += 50;
      else if (pos === "RB" || pos === "TE") s += 25;
      return s;
    }
    case "TE": {
      let s = Math.floor(
        ovr * 0.5 +
          (p.RunBlock || 0) * 0.125 +
          (p.PassBlock || 0) * 0.125 +
          (p.Catching || 0) * 0.125 +
          (p.Strength || 0) * 0.125,
      );
      if (pos === "TE") s += 100;
      else if (pos === "ATH" && arch === "Slotback") s += 50;
      else if (pos === "FB" || pos === "WR") s += 20;
      return s;
    }
    case "WR": {
      let s = Math.floor(
        ovr * 0.4 +
          (p.Speed || 0) * 0.12 +
          (p.Agility || 0) * 0.12 +
          (p.Catching || 0) * 0.12 +
          (p.Strength || 0) * 0.12 +
          (p.RouteRunning || 0) * 0.12,
      );
      if (pos === "WR") s += 100;
      else if (pos === "ATH" && ["Wingback", "Slotback"].includes(arch)) s += 50;
      else if (pos === "TE" || pos === "RB") s += 20;
      return s;
    }
    case "LT":
    case "RT": {
      let s = Math.floor(
        ovr * 0.7 +
          (p.Strength || 0) * 0.1 +
          (p.RunBlock || 0) * 0.75 +
          (p.PassBlock || 0) * 0.75 +
          (p.Agility || 0) * 0.05,
      );
      if (pos === "OT") s += 100;
      else if (pos === "ATH" && arch === "Lineman") s += 50;
      else if (pos === "OG") s += 25;
      else if (pos === "C") s += 15;
      return s;
    }
    case "LG":
    case "RG": {
      let s = Math.floor(
        ovr * 0.7 +
          (p.Strength || 0) * 0.1 +
          (p.RunBlock || 0) * 0.75 +
          (p.PassBlock || 0) * 0.75 +
          (p.Agility || 0) * 0.05,
      );
      if (pos === "OG") s += 100;
      else if (pos === "ATH" && arch === "Lineman") s += 50;
      else if (pos === "C") s += 25;
      else if (pos === "OT") s += 20;
      return s;
    }
    case "C": {
      let s = Math.floor(
        ovr * 0.7 +
          (p.Strength || 0) * 0.1 +
          (p.RunBlock || 0) * 0.75 +
          (p.PassBlock || 0) * 0.75 +
          (p.Agility || 0) * 0.05,
      );
      if (pos === "C") s += 100;
      else if (pos === "ATH" && arch === "Lineman") s += 50;
      else if (pos === "OG") s += 25;
      else if (pos === "OT") s += 15;
      return s;
    }
    case "LE":
    case "RE": {
      let s = Math.floor(
        ovr * 0.7 +
          (p.Strength || 0) * 0.05 +
          (p.Tackle || 0) * 0.05 +
          (p.PassRush || 0) * 0.75 +
          (p.RunDefense || 0) * 0.75 +
          (p.Agility || 0) * 0.05,
      );
      if (pos === "DE") s += 100;
      else if (pos === "ATH" && ["Lineman", "Strongside"].includes(arch)) s += 50;
      else if (pos === "OLB") s += 25;
      else if (pos === "DT") s += 10;
      return s;
    }
    case "DT": {
      let s = Math.floor(
        ovr * 0.7 +
          (p.Strength || 0) * 0.05 +
          (p.Tackle || 0) * 0.05 +
          (p.PassRush || 0) * 0.75 +
          (p.RunDefense || 0) * 0.75 +
          (p.Agility || 0) * 0.05,
      );
      if (pos === "DT") s += 100;
      else if (pos === "ATH" && ["Lineman", "Strongside"].includes(arch)) s += 50;
      else if (pos === "DE") s += 25;
      else if (pos === "OLB") s += 12;
      return s;
    }
    case "LOLB":
    case "ROLB": {
      let s = Math.floor(
        ovr * 0.6 +
          (p.Strength || 0) * 0.025 +
          (p.Tackle || 0) * 0.055 +
          (p.PassRush || 0) * 0.0755 +
          (p.RunDefense || 0) * 0.0755 +
          (p.ManCoverage || 0) * 0.075 +
          (p.ZoneCoverage || 0) * 0.075 +
          (p.Agility || 0) * 0.025,
      );
      if (pos === "OLB") s += 100;
      else if (
        pos === "ATH" &&
        ["Weakside", "Strongside", "Bandit"].includes(arch)
      )
        s += 50;
      else if (pos === "ILB") s += 25;
      else if (pos === "DE") s += 10;
      else if (pos === "SS") s += 5;
      return s;
    }
    case "MLB": {
      let s = Math.floor(
        ovr * 0.6 +
          (p.Strength || 0) * 0.025 +
          (p.Tackle || 0) * 0.055 +
          (p.PassRush || 0) * 0.0755 +
          (p.RunDefense || 0) * 0.0755 +
          (p.ManCoverage || 0) * 0.075 +
          (p.ZoneCoverage || 0) * 0.075 +
          (p.Agility || 0) * 0.025,
      );
      if (pos === "ILB") s += 100;
      else if (
        pos === "ATH" &&
        ["Weakside", "Bandit", "Field General"].includes(arch)
      )
        s += 50;
      else if (pos === "OLB") s += 25;
      else if (pos === "SS") s += 8;
      else if (pos === "DE") s += 3;
      return s;
    }
    case "CB": {
      let s = Math.floor(
        ovr * 0.5 +
          (p.Tackle || 0) * 0.05 +
          (p.Agility || 0) * 0.1 +
          (p.Catching || 0) * 0.1 +
          (p.ManCoverage || 0) * 0.01 +
          (p.ZoneCoverage || 0) * 0.01 +
          (p.Speed || 0) * 0.05,
      );
      if (pos === "CB") s += 100;
      else if (
        pos === "ATH" &&
        ["Triple-Threat", "Bandit", "Weakside"].includes(arch)
      )
        s += 50;
      else if (pos === "FS") s += 15;
      else if (pos === "SS") s += 10;
      return s;
    }
    case "FS": {
      let s = Math.floor(
        ovr * 0.5 +
          (p.Tackle || 0) * 0.05 +
          (p.Agility || 0) * 0.1 +
          (p.Catching || 0) * 0.1 +
          (p.ManCoverage || 0) * 0.01 +
          (p.ZoneCoverage || 0) * 0.01 +
          (p.Speed || 0) * 0.05,
      );
      if (pos === "FS") s += 100;
      else if (pos === "ATH" && ["Bandit", "Weakside"].includes(arch)) s += 50;
      else if (pos === "CB") s += 25;
      else if (pos === "SS") s += 15;
      return s;
    }
    case "SS": {
      let s = Math.floor(
        ovr * 0.5 +
          (p.Tackle || 0) * 0.05 +
          (p.Agility || 0) * 0.1 +
          (p.Catching || 0) * 0.1 +
          (p.ManCoverage || 0) * 0.01 +
          (p.ZoneCoverage || 0) * 0.01 +
          (p.Speed || 0) * 0.05,
      );
      if (pos === "SS") s += 100;
      else if (pos === "ATH" && ["Bandit", "Weakside"].includes(arch)) s += 50;
      else if (pos === "FS") s += 25;
      else if (pos === "CB") s += 15;
      return s;
    }
    case "P": {
      let s = (p.PuntAccuracy || 0) + (p.PuntPower || 0);
      if (pos === "P") s += 100;
      else if (pos === "ATH" && arch === "Soccer Player") s += 50;
      else if (pos === "K") s += 25;
      return s;
    }
    case "K":
    case "FG": {
      let s = (p.KickAccuracy || 0) + (p.KickPower || 0);
      if (pos === "K") s += 100;
      else if (pos === "ATH" && arch === "Soccer Player") s += 50;
      else if (pos === "P") s += 25;
      return s;
    }
    case "PR": {
      let s = (p.Agility || 0) + Math.floor(ovr * 0.2);
      if (pos === "ATH" && arch === "Return Specialist") s += 50;
      else if (pos === "WR" || pos === "RB") s += 25;
      return s;
    }
    case "KR": {
      let s = (p.Speed || 0) + Math.floor(ovr * 0.2);
      if (pos === "ATH" && arch === "Return Specialist") s += 50;
      else if (pos === "WR" || pos === "RB") s += 25;
      return s;
    }
    case "STU": {
      let s = (p.Tackle || 0) + Math.floor(ovr * 0.2);
      if (p.Year <= 2) s += 50;
      else if (p.Year === 3 && p.IsRedshirt) s += 25;
      return s;
    }
    default:
      return ovr;
  }
}

function autoFixCollegeDepthChart(
  dc: CollegeTeamDepthChart,
  roster: CollegePlayer[],
): { updatedDC: CollegeTeamDepthChart; fixedSlotsCount: number } {
  const playerByID = new Map<number, CollegePlayer>();
  roster.forEach((p) => playerByID.set(p.ID, p));

  const healthyActiveRoster = roster.filter(
    (p) => p.ID > 0 && !p.IsInjured && !p.IsRedshirting,
  );

  const usedInPosition = new Map<string, Set<number>>();
  const usedInOffDef = new Set<number>();
  const usedAsFirstString = new Set<number>();

  const originalSlots = dc.DepthChartPlayers || [];
  const slotValidFlags = new Array<boolean>(originalSlots.length).fill(false);

  // Pass 1: Identify all valid slots and mark their players as already in place
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
      !rosterPlayer!.IsRedshirting &&
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

  // Pass 2: Replace only invalid slots with the best next available player without duplicating
  let fixedSlotsCount = 0;
  const updatedPlayers: CollegeDepthChartPosition[] = originalSlots.map(
    (slot, idx) => {
      if (slotValidFlags[idx]) {
        const existingPlayer = playerByID.get(Number(slot.PlayerID));
        return existingPlayer
          ? ({
              ...slot,
              CollegePlayer: existingPlayer,
            } as CollegeDepthChartPosition)
          : slot;
      }

      const pos = slot.Position;
      const isST = SPECIAL_TEAMS_POSITIONS.has(pos);
      const isSTU = pos === "STU";
      const isFirstString = String(slot.PositionLevel) === "1";
      const posSet = usedInPosition.get(pos) || new Set<number>();
      usedInPosition.set(pos, posSet);

      const eligiblePositions = new Set(POSITION_ELIGIBILITY[pos] || [pos]);

      // Base pool: healthy, non-redshirting, NOT already in this depth chart position,
      // and if non-ST first string, NOT already first string at another position.
      const baseCandidates = healthyActiveRoster.filter((p) => {
        if (posSet.has(p.ID)) return false;
        if (isFirstString && !isST && usedAsFirstString.has(p.ID)) return false;
        return true;
      });

      // Score and sort candidates for this position
      const scoredEligible = baseCandidates
        .filter((p) => eligiblePositions.has(p.Position))
        .map((p) => ({
          player: p,
          score: scorePlayerForDCPosition(p, pos),
        }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            (b.player.Overall || 0) - (a.player.Overall || 0),
        );

      // Tier 1: Eligible for position AND not yet slotted in another Off/Def position (or non-1st-string for STU)
      let chosen: CollegePlayer | undefined = scoredEligible.find((c) =>
        isSTU
          ? !usedAsFirstString.has(c.player.ID)
          : isST
            ? true
            : !usedInOffDef.has(c.player.ID),
      )?.player;

      // Tier 2: Eligible for position (even if backup at another position, still never duplicated in same position)
      if (!chosen && scoredEligible.length > 0) {
        chosen = scoredEligible[0].player;
      }

      // Tier 3: Fallback to highest-Overall healthy active player not in this position
      if (!chosen && baseCandidates.length > 0) {
        const sortedFallback = [...baseCandidates].sort(
          (a, b) => (b.Overall || 0) - (a.Overall || 0),
        );
        chosen =
          sortedFallback.find((p) => !usedInOffDef.has(p.ID)) ||
          sortedFallback[0];
      }

      if (!chosen) {
        return slot;
      }

      posSet.add(chosen.ID);
      if (!isST) {
        usedInOffDef.add(chosen.ID);
        if (isFirstString) {
          usedAsFirstString.add(chosen.ID);
        }
      }

      fixedSlotsCount++;
      return {
        ...slot,
        PlayerID: chosen.ID,
        FirstName: chosen.FirstName,
        LastName: chosen.LastName,
        OriginalPosition: chosen.Position,
        CollegePlayer: chosen,
      } as CollegeDepthChartPosition;
    },
  );

  return {
    updatedDC: {
      ...dc,
      DepthChartPlayers: updatedPlayers,
    } as CollegeTeamDepthChart,
    fixedSlotsCount,
  };
}

interface InjuredDCEntry {
  team: CollegeTeam;
  dcPosition: string;
  positionLevel: string | number;
  player: CollegePlayer;
}

interface RosterBelow50Entry {
  team: CollegeTeam;
  activeHealthyCount: number;
  nonRedshirtingCount: number;
  redshirtingCount: number;
  injuredCount: number;
  totalCount: number;
}

interface GameBlockerEntry {
  team: CollegeTeam;
  issueType: string;
  details: string;
}

export const AdminReportsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    cfbTeams,
    cfbRosterMap,
    cfbDepthChartMap,
    currentCollegeSeasonGames,
    cfb_Timestamp,
    getBootstrapPlayerData,
    getBootstrapGameplanData,
    updateCFBDepthChartMap,
  } = useSimFBAStore();

  const [filterMode, setFilterMode] = useState<"ALL" | "FBS" | "USER">("ALL");
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [autoFixStatus, setAutoFixStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasFullRosterData = Object.keys(cfbRosterMap || {}).length > 1;
  const hasFullDepthChartData = Object.keys(cfbDepthChartMap || {}).length > 0;
  const isDataReady = hasFullRosterData && hasFullDepthChartData;

  useEffect(() => {
    console.log("[AdminReportsTab] Data status:", {
      hasFullRosterData,
      rosterTeamsCount: Object.keys(cfbRosterMap || {}).length,
      hasFullDepthChartData,
      dcTeamsCount: Object.keys(cfbDepthChartMap || {}).length,
      currentUserTeamId: currentUser?.teamId,
      currentUserRole: currentUser?.roleID,
    });
    if (!hasFullRosterData) {
      console.log("[AdminReportsTab] Calling getBootstrapPlayerData()...");
      getBootstrapPlayerData();
    }
    if (!hasFullDepthChartData) {
      console.log("[AdminReportsTab] Calling getBootstrapGameplanData()...");
      getBootstrapGameplanData();
    }
  }, [
    hasFullRosterData,
    hasFullDepthChartData,
    getBootstrapPlayerData,
    getBootstrapGameplanData,
    cfbRosterMap,
    cfbDepthChartMap,
    currentUser,
  ]);

  const filteredTeams = useMemo(() => {
    return (cfbTeams || []).filter((t) => {
      if (filterMode === "FBS") return t.IsFBS;
      if (filterMode === "USER")
        return Boolean(t.Coach && t.Coach !== "AI" && t.Coach.trim() !== "");
      return true;
    });
  }, [cfbTeams, filterMode]);

  // 1. Injured Players in Depth Charts + 3. Depth Chart / Game Blockers
  const { injuredInDepthCharts, gameBlockers } = useMemo(() => {
    const injuredList: InjuredDCEntry[] = [];
    const blockersList: GameBlockerEntry[] = [];
    if (!isDataReady) {
      return { injuredInDepthCharts: injuredList, gameBlockers: blockersList };
    }

    filteredTeams.forEach((team) => {
      const roster = cfbRosterMap?.[team.ID] || [];
      const playerByID = new Map<number, CollegePlayer>();
      roster.forEach((p) => playerByID.set(p.ID, p));

      const dc = cfbDepthChartMap?.[team.ID];
      if (!dc || !dc.DepthChartPlayers || dc.DepthChartPlayers.length === 0) {
        blockersList.push({
          team,
          issueType: "Missing Depth Chart",
          details: "Team has no depth chart positions loaded.",
        });
        return;
      }

      const missingStarterPositions: string[] = [];
      const redshirtedInDC: string[] = [];
      const duplicateInDC: string[] = [];
      const seenInPosition = new Map<string, Set<number>>();
      const seenFirstString = new Set<number>();

      dc.DepthChartPlayers.forEach((slot) => {
        const pid = Number(slot.PlayerID);
        const levelNum = Number(slot.PositionLevel);
        const isST = SPECIAL_TEAMS_POSITIONS.has(slot.Position);
        const rosterPlayer = playerByID.get(pid);

        if (!pid || !rosterPlayer || rosterPlayer.ID === 0) {
          if (levelNum <= 2 || pid > 0) {
            missingStarterPositions.push(
              `${slot.Position}${slot.PositionLevel}`,
            );
          }
          return;
        }

        if (!seenInPosition.has(slot.Position)) {
          seenInPosition.set(slot.Position, new Set<number>());
        }
        const posSet = seenInPosition.get(slot.Position)!;
        if (
          posSet.has(pid) ||
          (levelNum === 1 && !isST && seenFirstString.has(pid))
        ) {
          duplicateInDC.push(
            `${rosterPlayer.FirstName} ${rosterPlayer.LastName} (${slot.Position}${slot.PositionLevel})`,
          );
        }
        posSet.add(pid);
        if (levelNum === 1 && !isST) {
          seenFirstString.add(pid);
        }

        if (rosterPlayer.IsInjured) {
          injuredList.push({
            team,
            dcPosition: slot.Position,
            positionLevel: slot.PositionLevel,
            player: rosterPlayer,
          });
        }

        if (rosterPlayer.IsRedshirting) {
          redshirtedInDC.push(
            `${rosterPlayer.FirstName} ${rosterPlayer.LastName} (${slot.Position}${slot.PositionLevel})`,
          );
        }
      });

      if (missingStarterPositions.length > 0) {
        blockersList.push({
          team,
          issueType: "Empty / Missing Depth Chart Slots",
          details: `Unassigned or missing player slots: ${missingStarterPositions.slice(0, 8).join(", ")}${missingStarterPositions.length > 8 ? ` (+${missingStarterPositions.length - 8} more)` : ""}`,
        });
      }

      if (redshirtedInDC.length > 0) {
        blockersList.push({
          team,
          issueType: "Redshirting Player in Depth Chart",
          details: `Redshirting player(s) slotted: ${redshirtedInDC.slice(0, 5).join(", ")}${redshirtedInDC.length > 5 ? ` (+${redshirtedInDC.length - 5} more)` : ""}`,
        });
      }

      if (duplicateInDC.length > 0) {
        blockersList.push({
          team,
          issueType: "Duplicate Player in Depth Chart",
          details: `Duplicate player(s) slotted: ${duplicateInDC.slice(0, 5).join(", ")}${duplicateInDC.length > 5 ? ` (+${duplicateInDC.length - 5} more)` : ""}`,
        });
      }
    });

    // Also check current week games for schedule issues (missing team or timeslot)
    const currentWeekID = cfb_Timestamp?.CollegeWeekID ?? 0;
    (currentCollegeSeasonGames || [])
      .filter((g) => g.WeekID === currentWeekID && !g.GameComplete)
      .forEach((g) => {
        if (!g.HomeTeamID || !g.AwayTeamID) {
          const fallbackTeam =
            filteredTeams.find(
              (t) => t.ID === g.HomeTeamID || t.ID === g.AwayTeamID,
            ) ||
            ({
              ID: 0,
              TeamName: g.GameTitle || `Game #${g.ID}`,
              Mascot: "",
              TeamAbbr: "TBD",
              Conference: "",
              Coach: "N/A",
            } as CollegeTeam);
          blockersList.push({
            team: fallbackTeam,
            issueType: "Incomplete Scheduled Game",
            details: `Week ${g.Week} Game #${g.ID} (${g.GameTitle || "Matchup"}) is missing Home or Away team (${g.HomeTeam || "TBD"} vs ${g.AwayTeam || "TBD"}).`,
          });
        }
      });

    return { injuredInDepthCharts: injuredList, gameBlockers: blockersList };
  }, [
    isDataReady,
    filteredTeams,
    cfbRosterMap,
    cfbDepthChartMap,
    currentCollegeSeasonGames,
    cfb_Timestamp?.CollegeWeekID,
  ]);

  // 2. Active Rosters Below 50 Players
  const rostersBelow50 = useMemo(() => {
    const list: RosterBelow50Entry[] = [];
    if (!isDataReady) return list;

    filteredTeams.forEach((team) => {
      const roster = cfbRosterMap?.[team.ID] || [];
      const totalCount = roster.length;
      let redshirtingCount = 0;
      let injuredCount = 0;
      let activeHealthyCount = 0;
      let nonRedshirtingCount = 0;

      roster.forEach((p) => {
        if (p.IsRedshirting) {
          redshirtingCount++;
        } else {
          nonRedshirtingCount++;
          if (p.IsInjured) {
            injuredCount++;
          } else {
            activeHealthyCount++;
          }
        }
      });

      if (activeHealthyCount < 50 || nonRedshirtingCount < 50) {
        list.push({
          team,
          activeHealthyCount,
          nonRedshirtingCount,
          redshirtingCount,
          injuredCount,
          totalCount,
        });
      }
    });

    return list.sort((a, b) => a.activeHealthyCount - b.activeHealthyCount);
  }, [isDataReady, filteredTeams, cfbRosterMap]);

  // Unique teams currently called on this page with depth chart errors (blockers or injured players)
  const affectedDepthChartTeamIDs = useMemo(() => {
    const ids = new Set<number>();
    gameBlockers.forEach((entry) => {
      if (entry.team?.ID > 0 && cfbDepthChartMap?.[entry.team.ID]) {
        ids.add(entry.team.ID);
      }
    });
    injuredInDepthCharts.forEach((entry) => {
      if (entry.team?.ID > 0 && cfbDepthChartMap?.[entry.team.ID]) {
        ids.add(entry.team.ID);
      }
    });
    return Array.from(ids);
  }, [gameBlockers, injuredInDepthCharts, cfbDepthChartMap]);

  const handleAutoFixAllErrors = async () => {
    if (
      isAutoFixing ||
      affectedDepthChartTeamIDs.length === 0 ||
      !cfbDepthChartMap ||
      !cfbRosterMap
    ) {
      return;
    }

    setIsAutoFixing(true);
    setAutoFixStatus(null);

    try {
      const updatedMap: Record<number, CollegeTeamDepthChart> = {
        ...cfbDepthChartMap,
      };
      let totalTeamsFixed = 0;
      let totalSlotsFixed = 0;

      for (const teamID of affectedDepthChartTeamIDs) {
        const dc = cfbDepthChartMap[teamID];
        const roster = cfbRosterMap[teamID] || [];
        if (!dc || !dc.DepthChartPlayers || roster.length === 0) continue;

        const { updatedDC, fixedSlotsCount } = autoFixCollegeDepthChart(
          dc,
          roster,
        );
        if (fixedSlotsCount === 0) continue;

        const dto = {
          DepthChartID:
            updatedDC.ID ||
            updatedDC.DepthChartPlayers[0]?.DepthChartID ||
            teamID,
          UpdatedPlayerPositions: updatedDC.DepthChartPlayers.map(
            (dcPlayer) => ({
              ID: dcPlayer.ID,
              DepthChartID: dcPlayer.DepthChartID,
              PlayerID: dcPlayer.PlayerID,
              Position: dcPlayer.Position,
              PositionLevel: dcPlayer.PositionLevel,
              FirstName: dcPlayer.FirstName,
              LastName: dcPlayer.LastName,
              OriginalPosition:
                dcPlayer.CollegePlayer?.Position || dcPlayer.OriginalPosition,
            }),
          ),
        };

        await DepthChartService.SaveCFBDepthChart(dto);
        updatedMap[teamID] = updatedDC;
        totalTeamsFixed++;
        totalSlotsFixed += fixedSlotsCount;
      }

      updateCFBDepthChartMap(updatedMap);
      setAutoFixStatus({
        type: "success",
        text: `Auto-fix complete: replaced ${totalSlotsFixed} injured/redshirted/invalid slot(s) across ${totalTeamsFixed} team(s) with the best next available player.`,
      });
    } catch (err: any) {
      setAutoFixStatus({
        type: "error",
        text: err?.message || "Failed to auto-fix depth chart errors.",
      });
    } finally {
      setIsAutoFixing(false);
    }
  };

  if (!isDataReady) {
    return (
      <div className="flex flex-col w-full gap-y-4 p-6">
        <Text variant="h5">SimCFB League Health &amp; Roster Reports</Text>
        <Border classes="p-6 flex items-center justify-between">
          <Text variant="body-small" classes="text-gray-300">
            Loading league-wide college rosters and depth charts...
          </Text>
          <Button
            size="sm"
            variant="secondaryOutline"
            onClick={() => {
              console.log("[AdminReportsTab] Manual retry triggered");
              getBootstrapPlayerData();
              getBootstrapGameplanData();
            }}
          >
            Retry Load
          </Button>
        </Border>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-y-1">
          <Text variant="h5">SimCFB League Health &amp; Roster Reports</Text>
          <Text variant="small" classes="text-gray-400">
            Displays errors preventing games from running, teams with injured
            players in their depth charts, and teams with active rosters below
            50 players.
          </Text>
        </div>

        <ButtonGroup>
          <Button
            size="sm"
            variant={filterMode === "ALL" ? "primary" : "secondaryOutline"}
            onClick={() => setFilterMode("ALL")}
          >
            All Teams
          </Button>
          <Button
            size="sm"
            variant={filterMode === "FBS" ? "primary" : "secondaryOutline"}
            onClick={() => setFilterMode("FBS")}
          >
            FBS Only
          </Button>
          <Button
            size="sm"
            variant={filterMode === "USER" ? "primary" : "secondaryOutline"}
            onClick={() => setFilterMode("USER")}
          >
            User-Coached Only
          </Button>
        </ButtonGroup>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Border classes="p-4 flex flex-col gap-y-1">
          <Text variant="small" classes="text-gray-400">
            Game / Depth Chart Blockers
          </Text>
          <Text
            variant="h4"
            classes={
              gameBlockers.length > 0 ? "text-red-400" : "text-green-400"
            }
          >
            {gameBlockers.length}
          </Text>
        </Border>
        <Border classes="p-4 flex flex-col gap-y-1">
          <Text variant="small" classes="text-gray-400">
            Injured Players in Depth Charts
          </Text>
          <Text
            variant="h4"
            classes={
              injuredInDepthCharts.length > 0
                ? "text-amber-400"
                : "text-green-400"
            }
          >
            {injuredInDepthCharts.length}
          </Text>
        </Border>
        <Border classes="p-4 flex flex-col gap-y-1">
          <Text variant="small" classes="text-gray-400">
            Teams Below 50 Active Players
          </Text>
          <Text
            variant="h4"
            classes={
              rostersBelow50.length > 0 ? "text-red-400" : "text-green-400"
            }
          >
            {rostersBelow50.length}
          </Text>
        </Border>
      </div>

      {/* Auto-Fix Action Row between Summary Row and First Box */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          size="md"
          variant="primary"
          disabled={isAutoFixing || affectedDepthChartTeamIDs.length === 0}
          onClick={handleAutoFixAllErrors}
        >
          {isAutoFixing
            ? `AUTO FIXING (${affectedDepthChartTeamIDs.length} TEAMS)...`
            : "AUTO FIX ALL ERRORS"}
        </Button>
        {autoFixStatus && (
          <Text
            variant="small"
            classes={
              autoFixStatus.type === "success"
                ? "text-green-400 font-medium"
                : "text-red-400 font-medium"
            }
          >
            {autoFixStatus.text}
          </Text>
        )}
      </div>

      {/* Section 1: Errors Preventing Games Running */}
      <Border classes="p-4 flex flex-col gap-y-3">
        <Text variant="h6">
          1. Errors Preventing Games From Running ({gameBlockers.length})
        </Text>
        {gameBlockers.length === 0 ? (
          <Text variant="body-small" classes="text-green-400 py-2">
            No depth chart or schedule blockers detected for the selected teams.
          </Text>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="py-2 px-3">Team</th>
                  <th className="py-2 px-3">Conference</th>
                  <th className="py-2 px-3">Coach</th>
                  <th className="py-2 px-3">Error Type</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {gameBlockers.map((entry, idx) => (
                  <tr
                    key={`${entry.team.ID}-${idx}`}
                    className="hover:bg-gray-900/40"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-x-2">
                        {entry.team.ID > 0 && (
                          <Logo
                            url={getLogo(
                              SimCFB,
                              entry.team.ID,
                              currentUser?.IsRetro,
                            )}
                            variant="tiny"
                          />
                        )}
                        <span className="font-medium">
                          {entry.team.TeamName} {entry.team.Mascot}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">{entry.team.Conference}</td>
                    <td className="py-2 px-3">{entry.team.Coach || "AI"}</td>
                    <td className="py-2 px-3 text-red-400 font-medium">
                      {entry.issueType}
                    </td>
                    <td className="py-2 px-3 text-gray-300">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>

      {/* Section 2: Injured Players in Depth Charts */}
      <Border classes="p-4 flex flex-col gap-y-3">
        <Text variant="h6">
          2. Injured Players in Depth Charts ({injuredInDepthCharts.length})
        </Text>
        {injuredInDepthCharts.length === 0 ? (
          <Text variant="body-small" classes="text-green-400 py-2">
            No injured players are currently slotted on any depth charts.
          </Text>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="py-2 px-3">Team</th>
                  <th className="py-2 px-3">Coach</th>
                  <th className="py-2 px-3">DC Slot</th>
                  <th className="py-2 px-3">Player</th>
                  <th className="py-2 px-3">Injury</th>
                  <th className="py-2 px-3">Weeks Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {injuredInDepthCharts.map((item, idx) => (
                  <tr
                    key={`${item.team.ID}-${item.player.ID}-${idx}`}
                    className="hover:bg-gray-900/40"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(
                            SimCFB,
                            item.team.ID,
                            currentUser?.IsRetro,
                          )}
                          variant="tiny"
                        />
                        <span className="font-medium">
                          {item.team.TeamName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">{item.team.Coach || "AI"}</td>
                    <td className="py-2 px-3 font-semibold text-amber-400">
                      {item.dcPosition}
                      {item.positionLevel}
                    </td>
                    <td className="py-2 px-3">
                      {item.player.Position} {item.player.FirstName}{" "}
                      {item.player.LastName}
                    </td>
                    <td className="py-2 px-3 text-red-400">
                      {item.player.InjuryType || "Injured"}
                    </td>
                    <td className="py-2 px-3">
                      {item.player.WeeksOfRecovery} wk(s)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>

      {/* Section 3: Active Rosters Below 50 Players */}
      <Border classes="p-4 flex flex-col gap-y-3">
        <Text variant="h6">
          3. Teams with Active Rosters Below 50 Players ({rostersBelow50.length})
        </Text>
        {rostersBelow50.length === 0 ? (
          <Text variant="body-small" classes="text-green-400 py-2">
            All teams meet the minimum 50 active players requirement.
          </Text>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="py-2 px-3">Team</th>
                  <th className="py-2 px-3">Conference</th>
                  <th className="py-2 px-3">Division</th>
                  <th className="py-2 px-3">Coach</th>
                  <th className="py-2 px-3">Active (Healthy)</th>
                  <th className="py-2 px-3">Non-Redshirt</th>
                  <th className="py-2 px-3">Injured</th>
                  <th className="py-2 px-3">Redshirting</th>
                  <th className="py-2 px-3">Total Roster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rostersBelow50.map((entry) => (
                  <tr key={entry.team.ID} className="hover:bg-gray-900/40">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(
                            SimCFB,
                            entry.team.ID,
                            currentUser?.IsRetro,
                          )}
                          variant="tiny"
                        />
                        <span className="font-medium">
                          {entry.team.TeamName} {entry.team.Mascot}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">{entry.team.Conference}</td>
                    <td className="py-2 px-3">
                      {entry.team.IsFBS ? "FBS" : "FCS"}
                    </td>
                    <td className="py-2 px-3">{entry.team.Coach || "AI"}</td>
                    <td className="py-2 px-3 font-bold text-red-400">
                      {entry.activeHealthyCount} / 50
                    </td>
                    <td className="py-2 px-3">{entry.nonRedshirtingCount}</td>
                    <td className="py-2 px-3 text-amber-400">
                      {entry.injuredCount}
                    </td>
                    <td className="py-2 px-3">{entry.redshirtingCount}</td>
                    <td className="py-2 px-3">{entry.totalCount}</td>
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
