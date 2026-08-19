import { CollegePlayer, NFLPlayer } from "../../../../models/footballModels";
import { SimCFB, SimNFL } from "../../../../_constants/constants";
import { isGoodFit, isBadFit } from "../../../../_helper/recruitingHelper";

interface ScoredPlayer {
  player: CollegePlayer | NFLPlayer;
  score: number;
}

const SCHEME_BONUS = 5;

const POSITIONS_TO_ARRANGE = [
  "QB",
  "RB",
  "FB",
  "WR",
  "TE",
  "LT",
  "RT",
  "LG",
  "RG",
  "C",
  "LE",
  "RE",
  "DT",
  "LOLB",
  "ROLB",
  "MLB",
  "CB",
  "FS",
  "SS",
  "P",
  "K",
  "FG",
  "PR",
  "KR",
  "STU",
];

// These positions bypass the starterMap restriction (matches Golang isSpecialTeams check)
const SPECIAL_TEAMS_POSITIONS = new Set(["P", "K", "FG", "PR", "KR", "STU"]);

function getFitBonus(
  player: CollegePlayer | NFLPlayer,
  offScheme: string,
  defScheme: string,
): number {
  if (!offScheme || !defScheme) return 0;
  const good = isGoodFit(
    offScheme,
    defScheme,
    player.Position,
    player.Archetype,
  );
  const bad = isBadFit(offScheme, defScheme, player.Position, player.Archetype);
  if (good && !bad) return SCHEME_BONUS;
  if (bad && !good) return -SCHEME_BONUS;
  return 0;
}

function buildPositionMap(
  players: (CollegePlayer | NFLPlayer)[],
  league: typeof SimCFB | typeof SimNFL,
  offScheme: string,
  defScheme: string,
): Record<string, ScoredPlayer[]> {
  const map: Record<string, ScoredPlayer[]> = {
    QB: [],
    RB: [],
    FB: [],
    TE: [],
    WR: [],
    LT: [],
    RT: [],
    LG: [],
    RG: [],
    C: [],
    LE: [],
    RE: [],
    DT: [],
    LOLB: [],
    ROLB: [],
    MLB: [],
    CB: [],
    FS: [],
    SS: [],
    P: [],
    K: [],
    FG: [],
    PR: [],
    KR: [],
    STU: [],
  };

  // Alternating flags mirror the Golang logic for paired OL/DL/LB positions
  let isLT = true,
    isLG = true,
    isLE = true,
    isLOLB = true;

  // Pre-sort descending by overall so alternation distributes quality evenly
  const sorted = [...players].sort(
    (a, b) => (b.Overall || 0) - (a.Overall || 0),
  );

  for (const player of sorted) {
    const pos = player.Position;
    const arch = player.Archetype;
    const fit = getFitBonus(player, offScheme, defScheme);

    // QB
    if (["QB", "RB", "FB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "QB") score += 75;
      else if (
        pos === "ATH" &&
        ["Triple-Threat", "Field General"].includes(arch)
      )
        score += 50;
      score += player.Overall;
      map.QB.push({ player, score });
    }

    // RB
    if (["RB", "FB", "WR", "TE", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "RB") score += 100;
      else if (pos === "FB") score += 25;
      else if (
        pos === "ATH" &&
        ["Wingback", "Soccer Player", "Triple-Threat"].includes(arch)
      )
        score += 50;
      score += Math.floor(
        (player.Speed + player.Agility + player.Strength + player.Carrying) / 4,
      );
      map.RB.push({ player, score });
    }

    // FB
    if (["FB", "TE", "RB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "FB") score += 100;
      else if (pos === "ATH" && arch === "Wingback") score += 50;
      score += Math.floor(
        (player.Strength +
          player.Carrying +
          player.PassBlock +
          player.RunBlock) /
          4,
      );
      map.FB.push({ player, score });
    }

    // TE
    if (["TE", "FB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "TE") score += 100;
      else if (pos === "ATH" && arch === "Slotback") score += 50;
      score += Math.floor(
        player.Overall * 0.5 +
          player.RunBlock * 0.125 +
          player.PassBlock * 0.125 +
          player.Catching * 0.125 +
          player.Strength * 0.125,
      );
      map.TE.push({ player, score });
    }

    // WR
    if (["WR", "TE", "RB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "WR") score += 100;
      else if (pos === "ATH" && ["Wingback", "Slotback"].includes(arch))
        score += 50;
      score += Math.floor(
        player.Overall * 0.4 +
          player.Speed * 0.12 +
          player.Agility * 0.12 +
          player.Catching * 0.12 +
          player.Strength * 0.12 +
          player.RouteRunning * 0.12,
      );
      map.WR.push({ player, score });
    }

    // LT / RT alternating
    if (["OT", "OG", "C", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "OT") score += 100;
      else if (pos === "OG") score += 25;
      else if (pos === "ATH" && arch === "Lineman") score += 50;
      score += Math.floor(
        player.Overall * 0.7 +
          player.Strength * 0.1 +
          player.RunBlock * 0.75 +
          player.PassBlock * 0.75 +
          player.Agility * 0.05,
      );
      map[isLT ? "LT" : "RT"].push({ player, score });
      isLT = !isLT;
    }

    // LG / RG alternating
    if (["OT", "OG", "C", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "OG") score += 100;
      else if (pos === "C") score += 25;
      else if (pos === "ATH" && arch === "Lineman") score += 50;
      score += Math.floor(
        player.Overall * 0.7 +
          player.Strength * 0.1 +
          player.RunBlock * 0.75 +
          player.PassBlock * 0.75 +
          player.Agility * 0.05,
      );
      map[isLG ? "LG" : "RG"].push({ player, score });
      isLG = !isLG;
    }

    // C
    if (["OT", "OG", "C", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "C") score += 100;
      else if (pos === "OG") score += 15;
      else if (pos === "ATH" && arch === "Lineman") score += 50;
      score += Math.floor(
        player.Overall * 0.7 +
          player.Strength * 0.1 +
          player.RunBlock * 0.75 +
          player.PassBlock * 0.75 +
          player.Agility * 0.05,
      );
      map.C.push({ player, score });
    }

    // LE / RE alternating
    if (["DE", "DT", "OLB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "DE") score += 100;
      else if (pos === "OLB") score += 25;
      else if (pos === "DT") score += 3;
      else if (pos === "ATH" && ["Lineman", "Strongside"].includes(arch))
        score += 50;
      score += Math.floor(
        player.Overall * 0.7 +
          player.Strength * 0.05 +
          player.Tackle * 0.05 +
          player.PassRush * 0.75 +
          player.RunDefense * 0.75 +
          player.Agility * 0.05,
      );
      map[isLE ? "LE" : "RE"].push({ player, score });
      isLE = !isLE;
    }

    // DT
    if (["DE", "DT", "OLB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "DT") score += 100;
      else if (pos === "DE") score += 25;
      else if (pos === "OLB") score += 12;
      else if (pos === "ATH" && ["Lineman", "Strongside"].includes(arch))
        score += 50;
      score += Math.floor(
        player.Overall * 0.7 +
          player.Strength * 0.05 +
          player.Tackle * 0.05 +
          player.PassRush * 0.75 +
          player.RunDefense * 0.75 +
          player.Agility * 0.05,
      );
      map.DT.push({ player, score });
    }

    // LOLB / ROLB alternating
    if (["OLB", "DE", "ILB", "SS", "FS", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "OLB") score += 100;
      else if (pos === "DE") score += 10;
      else if (pos === "ILB") score += 25;
      else if (pos === "SS") score += 3;
      else if (
        pos === "ATH" &&
        ["Weakside", "Strongside", "Bandit"].includes(arch)
      )
        score += 50;
      score += Math.floor(
        player.Overall * 0.6 +
          player.Strength * 0.025 +
          player.Tackle * 0.055 +
          player.PassRush * 0.0755 +
          player.RunDefense * 0.0755 +
          player.ManCoverage * 0.075 +
          player.ZoneCoverage * 0.075 +
          player.Agility * 0.025,
      );
      map[isLOLB ? "LOLB" : "ROLB"].push({ player, score });
      isLOLB = !isLOLB;
    }

    // MLB (ILB in Golang maps to MLB slot)
    if (["OLB", "DE", "ILB", "SS", "FS", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "ILB") score += 100;
      else if (pos === "OLB") score += 25;
      else if (pos === "SS") score += 8;
      else if (pos === "DE") score += 3;
      else if (
        pos === "ATH" &&
        ["Weakside", "Bandit", "Field General"].includes(arch)
      )
        score += 50;
      score += Math.floor(
        player.Overall * 0.6 +
          player.Strength * 0.025 +
          player.Tackle * 0.055 +
          player.PassRush * 0.0755 +
          player.RunDefense * 0.0755 +
          player.ManCoverage * 0.075 +
          player.ZoneCoverage * 0.075 +
          player.Agility * 0.025,
      );
      map.MLB.push({ player, score });
    }

    // CB
    if (["CB", "FS", "SS", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "CB") score += 100;
      else if (pos === "FS") score += 10;
      else if (pos === "SS") score += 8;
      else if (
        pos === "ATH" &&
        ["Triple-Threat", "Bandit", "Weakside"].includes(arch)
      )
        score += 50;
      score += Math.floor(
        player.Overall * 0.5 +
          player.Tackle * 0.05 +
          player.Agility * 0.1 +
          player.Catching * 0.1 +
          player.ManCoverage * 0.01 +
          player.ZoneCoverage * 0.01 +
          player.Speed * 0.05,
      );
      map.CB.push({ player, score });
    }

    // FS
    if (["CB", "FS", "SS", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "FS") score += 100;
      else if (pos === "CB") score += 25;
      else if (pos === "SS") score += 12;
      else if (pos === "ATH" && ["Bandit", "Weakside"].includes(arch))
        score += 50;
      score += Math.floor(
        player.Overall * 0.5 +
          player.Tackle * 0.05 +
          player.Agility * 0.1 +
          player.Catching * 0.1 +
          player.ManCoverage * 0.01 +
          player.ZoneCoverage * 0.01 +
          player.Speed * 0.05,
      );
      map.FS.push({ player, score });
    }

    // SS
    if (["CB", "FS", "SS", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "SS") score += 100;
      else if (pos === "FS") score += 25;
      else if (pos === "CB") score += 12;
      else if (pos === "ATH" && ["Bandit", "Weakside"].includes(arch))
        score += 50;
      score += Math.floor(
        player.Overall * 0.5 +
          player.Tackle * 0.05 +
          player.Agility * 0.1 +
          player.Catching * 0.1 +
          player.ManCoverage * 0.01 +
          player.ZoneCoverage * 0.01 +
          player.Speed * 0.05,
      );
      map.SS.push({ player, score });
    }

    // P
    if (["K", "P", "QB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "P") score += 100;
      else if (pos === "K") score += 25;
      else if (pos === "ATH" && arch === "Soccer Player") score += 50;
      score += player.PuntAccuracy + player.PuntPower;
      map.P.push({ player, score });
    }

    // K
    if (["K", "P", "QB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "K") score += 100;
      else if (pos === "P") score += 25;
      else if (pos === "ATH" && arch === "Soccer Player") score += 50;
      score += player.KickAccuracy + player.KickPower;
      map.K.push({ player, score });
    }

    // FG
    if (["K", "P", "QB", "ATH"].includes(pos)) {
      let score = fit;
      if (pos === "K") score += 100;
      else if (pos === "P") score += 25;
      else if (pos === "ATH" && arch === "Soccer Player") score += 50;
      score += player.KickAccuracy + player.KickPower;
      map.FG.push({ player, score });
    }

    // PR
    if (["WR", "RB", "FS", "SS", "CB", "ATH"].includes(pos)) {
      let score = 0;
      if (pos === "ATH" && arch === "Return Specialist") score += 50;
      else if (["WR", "RB"].includes(pos)) score += 25;
      score += player.Agility;
      map.PR.push({ player, score });
    }

    // KR
    if (["WR", "RB", "FS", "SS", "CB", "ATH"].includes(pos)) {
      let score = 0;
      if (pos === "ATH" && arch === "Return Specialist") score += 50;
      else if (["WR", "RB"].includes(pos)) score += 25;
      score += player.Speed;
      map.KR.push({ player, score });
    }

    // STU
    if (
      ["FB", "TE", "ILB", "OLB", "RB", "CB", "FS", "SS", "WR", "ATH"].includes(
        pos,
      )
    ) {
      let score = 0;
      if (league === SimCFB) {
        const year = (player as CollegePlayer).Year;
        const isRedshirt = (player as CollegePlayer).IsRedshirt;
        if (year <= 2) score += 50;
        else if (year === 3 && isRedshirt) score += 25;
      } else {
        const exp = (player as NFLPlayer).Experience;
        if (exp <= 1) score += 50;
        else if (exp === 2) score += 25;
      }
      score += player.Tackle;
      map.STU.push({ player, score });
    }
  }

  for (const pos of Object.keys(map)) {
    map[pos].sort((a, b) => b.score - a.score);
  }

  return map;
}

export function autoArrangeDepthChart(
  players: (CollegePlayer | NFLPlayer)[],
  depthChart: any,
  league: typeof SimCFB | typeof SimNFL,
  gameplan?: any,
): any {
  const offScheme: string = gameplan?.OffensiveScheme ?? "";
  const defScheme: string = gameplan?.DefensiveScheme ?? "";

  const eligible = players.filter((p) => {
    if (p.IsInjured) return false;
    if ((p as any).IsPracticeSquad) return false;
    if (league === SimCFB && (p as CollegePlayer).IsRedshirting) return false;
    return true;
  });

  const positionMap = buildPositionMap(eligible, league, offScheme, defScheme);

  const originalSlots: any[] = depthChart.DepthChartPlayers ?? [];

  // Process slots in position-group order, then by level, matching Golang iteration order
  const sortedSlots = [...originalSlots].sort((a, b) => {
    const aIdx = POSITIONS_TO_ARRANGE.indexOf(a.Position);
    const bIdx = POSITIONS_TO_ARRANGE.indexOf(b.Position);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return parseInt(a.PositionLevel) - parseInt(b.PositionLevel);
  });

  const starterMap = new Set<number>();
  const backupMap = new Set<number>();
  const stuMap = new Set<number>();

  // Track updates keyed by original slot reference
  const updates = new Map<any, any>();

  for (const slot of sortedSlots) {
    const position: string = slot.Position;
    const isSTU = position === "STU";
    const isSpecialTeams = SPECIAL_TEAMS_POSITIONS.has(position);
    const isStarterSlot = String(slot.PositionLevel) === "1";
    const candidates = positionMap[position] ?? [];

    for (const candidate of candidates) {
      const playerId: number =
        (candidate.player as any).PlayerID || (candidate.player as any).ID;

      // Mirrors Golang: starters can't fill non-ST slots elsewhere
      if (!isSpecialTeams && starterMap.has(playerId)) continue;
      // Mirrors Golang: backups can't fill another backup slot (but can fill level-1)
      if (!isStarterSlot && !isSTU && backupMap.has(playerId)) continue;
      // STU tracked independently
      if (isSTU && stuMap.has(playerId)) continue;

      const p = candidate.player;
      updates.set(slot, {
        ...slot,
        PlayerID: playerId,
        FirstName: p.FirstName ?? "",
        LastName: p.LastName ?? "",
        OriginalPosition: p.Position ?? "",
        CollegePlayer: league === SimCFB ? p : slot.CollegePlayer,
        NFLPlayer: league === SimNFL ? p : slot.NFLPlayer,
      });

      if (isSTU) {
        stuMap.add(playerId);
      } else if (isStarterSlot) {
        starterMap.add(playerId);
      } else {
        backupMap.add(playerId);
      }
      break;
    }
  }

  return {
    ...depthChart,
    DepthChartPlayers: originalSlots.map((slot) => updates.get(slot) ?? slot),
  };
}
