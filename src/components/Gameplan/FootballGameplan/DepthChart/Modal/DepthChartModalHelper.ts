import { CollegePlayer, NFLPlayer } from "../../../../../models/footballModels";
import { SimCFB, SimNFL } from "../../../../../_constants/constants";
import { POSITION_LIMITS } from "../../Constants/DepthChartConstants";
import { getCFBOverall } from "../../../../../_utility/getLetterGrade";
import { GetNFLOverall } from "../../../../Team/TeamPageUtils";

export const getEligiblePositionsForDepthPosition = (
  position: string,
): string[] => {
  switch (position) {
    case "QB":
      return ["QB", "RB", "FB", "WR", "TE", "K", "P", "ATH"];
    case "RB":
      return ["RB", "FB", "QB", "WR", "ATH"];
    case "FB":
      return ["FB", "RB", "TE", "ATH"];
    case "TE":
      return ["TE", "RB", "FB", "WR", "ATH"];
    case "WR":
      return ["WR", "TE", "RB", "FB", "QB", "ATH"];
    case "LT":
    case "LG":
    case "C":
    case "RG":
    case "RT":
      return ["OT", "OG", "LT", "LG", "C", "RG", "RT", "FB", "TE", "ATH"];
    case "LE":
    case "RE":
      return ["DE", "ATH", "DT", "OLB", "ILB", "SS", "FS"];
    case "DT":
      return ["DT", "ATH", "DE", "OLB", "ILB"];
    case "LOLB":
    case "ROLB":
      return ["OLB", "ATH", "ILB", "DE", "SS", "DT", "FS", "CB"];
    case "MLB":
      return ["ILB", "ATH", "OLB", "SS", "FS", "CB", "DT", "DE"];
    case "CB":
      return ["CB", "ATH", "FS", "SS", "OLB", "ILB"];
    case "FS":
      return ["FS", "ATH", "CB", "SS", "OLB", "ILB"];
    case "SS":
      return ["SS", "ATH", "FS", "CB", "OLB", "ILB"];
    case "P":
      return ["P", "K", "ATH", "QB"];
    case "PR":
      return ["RB", "WR", "ATH", "FB", "CB", "FS"];
    case "K":
      return ["K", "P", "ATH", "QB"];
    case "KR":
      return ["RB", "WR", "ATH", "FB", "CB", "FS"];
    case "FG":
      return ["K", "P", "ATH", "QB"];
    case "STU":
      return [
        "QB",
        "RB",
        "FB",
        "WR",
        "TE",
        "OT",
        "OG",
        "LT",
        "LG",
        "C",
        "RG",
        "RT",
        "DE",
        "DT",
        "OLB",
        "ILB",
        "CB",
        "FS",
        "SS",
        "ATH",
      ];

    default:
      return [position, "ATH"];
  }
};

export const getAvailablePlayersForPosition = (
  position: string,
  players: (CollegePlayer | NFLPlayer)[],
) => {
  const eligiblePositions = getEligiblePositionsForDepthPosition(position);
  return players.filter((player) =>
    eligiblePositions.includes(player.Position),
  );
};

const POSITION_PRIORITY_MAP: Record<string, string[]> = {
  LE: ["DE", "DT", "OLB", "ILB", "SS", "FS"],
  RE: ["DE", "DT", "OLB", "ILB", "SS", "FS"],
  DT: ["DT", "DE", "ILB", "OLB"],

  LOLB: ["OLB", "ILB", "SS", "DT", "FS", "CB", "DE"],
  ROLB: ["OLB", "ILB", "SS", "DT", "FS", "CB", "DE"],
  MLB: ["ILB", "OLB", "SS", "FS", "CB", "DT", "DE"],

  SS: ["SS", "FS", "CB", "OLB", "ILB"],
  FS: ["FS", "SS", "CB", "OLB", "ILB"],
  CB: ["CB", "FS", "SS", "OLB", "ILB"],

  LT: ["OT", "OG", "C", "LT", "RT", "LG", "RG", "FB", "TE"],
  RT: ["OT", "OG", "C", "RT", "LT", "RG", "LG", "FB", "TE"],
  LG: ["OG", "OT", "C", "LG", "RG", "LT", "RT", "FB", "TE"],
  RG: ["OG", "OT", "C", "RG", "LG", "RT", "LT", "FB", "TE"],
  C: ["C", "OG", "OT", "LG", "RG", "LT", "RT", "FB", "TE"],
};

const getPositionPriority = (
  position: string,
  playerPosition: string,
): number => {
  const priorityList = POSITION_PRIORITY_MAP[position];
  if (!priorityList) {
    return playerPosition === position ? 0 : 1;
  }

  const index = priorityList.indexOf(playerPosition);
  if (index === -1) {
    return playerPosition === "ATH" ? 999 : 998;
  }
  return index;
};

export const getUnassignedPlayersForPosition = (
  position: string,
  players: (CollegePlayer | NFLPlayer)[],
  depthChart: any,
  league: typeof SimCFB | typeof SimNFL,
) => {
  const assignedToThisPosition = new Set(
    (depthChart?.DepthChartPlayers || [])
      .filter((dcPlayer: any) => dcPlayer.Position === position)
      .map((dcPlayer: any) => dcPlayer.PlayerID),
  );

  const availableForPosition = getAvailablePlayersForPosition(
    position,
    players,
  );

  const filtered = availableForPosition.filter((player) => {
    const playerId = (player as any).PlayerID || (player as any).ID;
    const isPracticeSquad = (player as any).IsPracticeSquad || false;

    const isRedshirting =
      league === SimCFB && (player as CollegePlayer).IsRedshirting;

    return (
      !isPracticeSquad &&
      !isRedshirting &&
      !assignedToThisPosition.has(playerId)
    );
  });

  return filtered.sort((a, b) => {
    if (position === "PR" || position === "KR") {
      const aSpeed =
        league === SimNFL ? (a as NFLPlayer).Speed : (a as CollegePlayer).Speed;
      const bSpeed =
        league === SimNFL ? (b as NFLPlayer).Speed : (b as CollegePlayer).Speed;
      return (bSpeed || 0) - (aSpeed || 0);
    }

    if (position === "STU") {
      const aStrength =
        league === SimNFL
          ? (a as NFLPlayer).Strength
          : (a as CollegePlayer).Strength;
      const bStrength =
        league === SimNFL
          ? (b as NFLPlayer).Strength
          : (b as CollegePlayer).Strength;
      return (bStrength || 0) - (aStrength || 0);
    }

    const aPriority = getPositionPriority(position, a.Position);
    const bPriority = getPositionPriority(position, b.Position);

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    const aOverall =
      league === SimNFL
        ? (a as NFLPlayer).Overall
        : (a as CollegePlayer).Overall;
    const bOverall =
      league === SimNFL
        ? (b as NFLPlayer).Overall
        : (b as CollegePlayer).Overall;
    return (bOverall || 0) - (aOverall || 0);
  });
};

export const getAllAssignedPlayersForPosition = (
  position: string,
  players: (CollegePlayer | NFLPlayer)[],
  depthChart: any,
) => {
  if (!depthChart?.DepthChartPlayers) return [];

  const limit = POSITION_LIMITS[position as keyof typeof POSITION_LIMITS];
  const assignedPlayers = depthChart.DepthChartPlayers.filter(
    (dcPlayer: any) => dcPlayer.Position === position,
  )
    .sort((a: any, b: any) => a.PositionLevel - b.PositionLevel)
    .map((dcPlayer: any) => {
      const player = players.find(
        (p: CollegePlayer | NFLPlayer) =>
          (p as any).PlayerID === dcPlayer.PlayerID ||
          (p as any).ID === dcPlayer.PlayerID,
      );
      return { ...dcPlayer, playerData: player };
    })
    .filter((item: any) => item.playerData);

  const allLevels = [];
  for (let i = 1; i <= limit; i++) {
    const assignedPlayer = assignedPlayers.find(
      (p: any) => parseInt(p.PositionLevel) === i,
    );
    allLevels.push({
      PositionLevel: i,
      Position: position,
      PlayerID: assignedPlayer?.PlayerID || null,
      playerData: assignedPlayer?.playerData || null,
      isEmpty: !assignedPlayer,
    });
  }

  return allLevels;
};

export const getOverarchingPosition = (position: string): string => {
  switch (position) {
    case "LT":
    case "RT":
      return "OT";
    case "LG":
    case "RG":
      return "OG";
    case "C":
      return "C";
    case "LE":
    case "RE":
      return "DE";
    case "DT":
      return "DT";
    case "MLB":
      return "ILB";
    case "LOLB":
    case "ROLB":
      return "OLB";
    case "CB":
      return "CB";
    case "FS":
      return "FS";
    case "SS":
      return "SS";
    case "STU":
      return "STU";
    case "FG":
      return "FG";
    case "PR":
      return "PR";
    case "KR":
      return "KR";
    default:
      return position;
  }
};

export const getPlayerOverall = (
  player: CollegePlayer | NFLPlayer,
  league: typeof SimCFB | typeof SimNFL,
) => {
  if (league === SimNFL) {
    const nflPlayer = player as NFLPlayer;
    const rawOverall = nflPlayer.Overall || 0;
    if (nflPlayer.ShowLetterGrade) {
      return GetNFLOverall(rawOverall, true);
    }
    return rawOverall;
  } else {
    const cfbPlayer = player as CollegePlayer;
    const rawOverall = cfbPlayer.Overall || 0;
    return getCFBOverall(rawOverall, cfbPlayer.Year);
  }
};

export const getRatingColor = (rating: number | string) => {
  if (typeof rating === "string") {
    switch (rating) {
      case "A+":
      case "A":
        return "text-yellow-400";
      case "A-":
      case "B+":
        return "text-purple-400";
      case "B":
      case "B-":
        return "text-blue-400";
      case "C+":
      case "C":
      case "C-":
        return "text-green-400";
      case "D+":
      case "D":
      case "D-":
        return "text-gray-300";
      default:
        return "text-gray-500";
    }
  }

  if (rating >= 85) return "text-yellow-400";
  if (rating >= 80) return "text-purple-400";
  if (rating >= 75) return "text-blue-400";
  if (rating >= 70) return "text-green-400";
  if (rating >= 65) return "text-gray-300";
  return "text-gray-500";
};

export const getRatingBgColor = (rating: number | string) => {
  if (typeof rating === "string") {
    switch (rating) {
      case "A+":
      case "A":
        return "bg-yellow-400";
      case "A-":
      case "B+":
        return "bg-purple-400";
      case "B":
      case "B-":
        return "bg-blue-400";
      case "C+":
      case "C":
      case "C-":
        return "bg-green-400";
      case "D+":
      case "D":
      case "D-":
        return "bg-gray-300";
      default:
        return "bg-gray-500";
    }
  }

  if (rating >= 85) return "bg-yellow-400";
  if (rating >= 80) return "bg-purple-400";
  if (rating >= 75) return "bg-blue-400";
  if (rating >= 70) return "bg-green-400";
  if (rating >= 65) return "bg-gray-300";
  return "bg-gray-500";
};

export const findPlayerData = (
  playerId: number,
  players: (CollegePlayer | NFLPlayer)[],
) => {
  return players.find(
    (p) => (p as any).PlayerID === playerId || (p as any).ID === playerId,
  );
};

export const updatePlayerInfo = (
  slot: any,
  playerData: any,
  playerId: number,
  league: typeof SimCFB | typeof SimNFL,
) => ({
  ...slot,
  PlayerID: playerData.PlayerID || playerData.ID || playerId,
  FirstName: playerData.FirstName || "",
  LastName: playerData.LastName || "",
  OriginalPosition: playerData.Position || "",
  CollegePlayer: league === SimCFB ? playerData : slot.CollegePlayer,
  NFLPlayer: league === SimNFL ? playerData : slot.NFLPlayer,
});

export const swapPlayersData = (
  slot1: any,
  slot2: any,
  league: typeof SimCFB | typeof SimNFL,
): [any, any] => {
  const swappedSlot1 = {
    ...slot1,
    PlayerID: slot2.PlayerID,
    FirstName: slot2.FirstName,
    LastName: slot2.LastName,
    OriginalPosition: slot2.OriginalPosition,
    CollegePlayer:
      league === SimCFB ? slot2.CollegePlayer : slot1.CollegePlayer,
    NFLPlayer: league === SimNFL ? slot2.NFLPlayer : slot1.NFLPlayer,
  };

  const swappedSlot2 = {
    ...slot2,
    PlayerID: slot1.PlayerID,
    FirstName: slot1.FirstName,
    LastName: slot1.LastName,
    OriginalPosition: slot1.OriginalPosition,
    CollegePlayer:
      league === SimCFB ? slot1.CollegePlayer : slot2.CollegePlayer,
    NFLPlayer: league === SimNFL ? slot1.NFLPlayer : slot2.NFLPlayer,
  };

  return [swappedSlot1, swappedSlot2];
};

export const clearPlayerFromSlot = (slot: any): any => ({
  ...slot,
  PlayerID: 0,
  FirstName: "",
  LastName: "",
  OriginalPosition: "",
});

export const isPlayerOnTeam = (
  playerId: number,
  players: (CollegePlayer | NFLPlayer)[],
): boolean => {
  return players.some((player) => {
    const id = (player as any).ID || (player as any).PlayerID;
    return id === playerId;
  });
};
