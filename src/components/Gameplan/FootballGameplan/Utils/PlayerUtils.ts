import { CollegePlayer, NFLPlayer } from "../../../../models/footballModels";
import { SimCFB, SimNFL } from "../../../../_constants/constants";
import {
  POSITION_ELIGIBILITY,
  OVERARCHING_POSITIONS,
  SPECIAL_POSITION_SORTING,
} from "../Constants/DepthChartConstants";

export const getPlayerDisplayName = (
  player: CollegePlayer | NFLPlayer | null | undefined,
  format: "full" | "short" | "initial" | "archetype" = "full"
): string => {
  if (!player) {
    return "Unknown Player";
  }

  switch (format) {
    case "short":
      return `${player.FirstName || "Unknown"} ${player.LastName || "Player"}`;
    case "initial":
      return `${player.FirstName?.charAt(0) || "U"}. ${
        player.LastName || "Player"
      }`;
    case "archetype":
      return `${player.Archetype || ""} ${player.Position || ""} ${
        player.FirstName || "Unknown"
      } ${player.LastName || "Player"}`;
    case "full":
    default:
      return `${player.Archetype || ""} ${player.Position || ""} ${
        player.FirstName || "Unknown"
      } ${player.LastName || "Player"}`;
  }
};

export const sortPlayersByOverall = (
  players: (CollegePlayer | NFLPlayer)[],
  league: typeof SimCFB | typeof SimNFL,
  ascending: boolean = false
): (CollegePlayer | NFLPlayer)[] => {
  return [...players].sort((a, b) => {
    const aOverall =
      league === SimNFL
        ? (a as NFLPlayer).Overall
        : (a as CollegePlayer).Overall;
    const bOverall =
      league === SimNFL
        ? (b as NFLPlayer).Overall
        : (b as CollegePlayer).Overall;
    const diff = (bOverall || 0) - (aOverall || 0);
    return ascending ? -diff : diff;
  });
};

export const sortPlayersByAttribute = (
  players: (CollegePlayer | NFLPlayer)[],
  league: typeof SimCFB | typeof SimNFL,
  position: string,
  ascending: boolean = false
): (CollegePlayer | NFLPlayer)[] => {
  const sortAttribute =
    SPECIAL_POSITION_SORTING[position as keyof typeof SPECIAL_POSITION_SORTING];

  if (!sortAttribute) {
    return sortPlayersByOverall(players, league, ascending);
  }

  return [...players].sort((a, b) => {
    const aValue =
      league === SimNFL
        ? (a as NFLPlayer)[sortAttribute as keyof NFLPlayer]
        : (a as CollegePlayer)[sortAttribute as keyof CollegePlayer];
    const bValue =
      league === SimNFL
        ? (b as NFLPlayer)[sortAttribute as keyof NFLPlayer]
        : (b as CollegePlayer)[sortAttribute as keyof CollegePlayer];

    const diff = ((bValue as number) || 0) - ((aValue as number) || 0);
    return ascending ? -diff : diff;
  });
};

export const getEligiblePositionsForDepthPosition = (
  position: string
): string[] => {
  return POSITION_ELIGIBILITY[position] || [position, "ATH"];
};

export const getOverarchingPosition = (position: string): string => {
  return OVERARCHING_POSITIONS[position] || position;
};

export const filterEligiblePlayers = (
  players: (CollegePlayer | NFLPlayer)[],
  position: string,
  excludePracticeSquad: boolean = true,
  excludeRedshirt: boolean = true,
  league?: typeof SimCFB | typeof SimNFL
): (CollegePlayer | NFLPlayer)[] => {
  const eligiblePositions = getEligiblePositionsForDepthPosition(position);

  return players.filter((player) => {
    const playerPosition = player.Position;
    const isPracticeSquad = (player as any).IsPracticeSquad || false;
    const isRedshirting =
      league === SimCFB &&
      excludeRedshirt &&
      (player as CollegePlayer).IsRedshirting;

    return (
      eligiblePositions.includes(playerPosition) &&
      (!excludePracticeSquad || !isPracticeSquad) &&
      !isRedshirting
    );
  });
};

export const getPlayerById = (
  players: (CollegePlayer | NFLPlayer)[],
  playerId: number
): (CollegePlayer | NFLPlayer) | undefined => {
  return players.find(
    (player) =>
      (player as any).PlayerID === playerId || (player as any).ID === playerId
  );
};

export const getPlayerId = (
  player: CollegePlayer | NFLPlayer | null | undefined
): number => {
  if (!player) {
    return -1;
  }
  return (player as any).PlayerID || (player as any).ID || -1;
};

export const filterUnassignedPlayers = (
  players: (CollegePlayer | NFLPlayer)[],
  assignedPlayerIds: Set<number>
): (CollegePlayer | NFLPlayer)[] => {
  return players.filter(
    (player) => !assignedPlayerIds.has(getPlayerId(player))
  );
};

export const getAssignedPlayerIds = (depthChart: any): Set<number> => {
  if (!depthChart?.DepthChartPlayers) return new Set();
  return new Set(
    depthChart.DepthChartPlayers.map((dcPlayer: any) => dcPlayer.PlayerID)
  );
};

export const getPlayersForPosition = (
  depthChart: any,
  position: string,
  startingLevel: number = 1,
  levelCount: number = 1
): any[] => {
  if (!depthChart?.DepthChartPlayers) return [];

  return depthChart.DepthChartPlayers.filter(
    (dcPlayer: any) => dcPlayer.Position === position
  )
    .sort(
      (a: any, b: any) => parseInt(a.PositionLevel) - parseInt(b.PositionLevel)
    )
    .slice(startingLevel - 1, startingLevel - 1 + levelCount);
};

export const groupPlayersByPosition = (
  players: (CollegePlayer | NFLPlayer)[],
  customLabels?: Record<string, string>
): Record<string, (CollegePlayer | NFLPlayer)[]> => {
  return players.reduce((groups, player) => {
    let position = player.Position;

    if (customLabels && customLabels[position]) {
      position = customLabels[position];
    }

    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(player);
    return groups;
  }, {} as Record<string, (CollegePlayer | NFLPlayer)[]>);
};

export const getPlayerPositionLevel = (
  depthChart: any,
  playerId: number,
  position: string
): number | null => {
  if (!depthChart?.DepthChartPlayers) return null;

  const dcPlayer = depthChart.DepthChartPlayers.find(
    (player: any) =>
      player.PlayerID === playerId && player.Position === position
  );

  return dcPlayer ? parseInt(dcPlayer.PositionLevel) : null;
};

export const isPlayerAssignedToPosition = (
  depthChart: any,
  playerId: number,
  position: string
): boolean => {
  return getPlayerPositionLevel(depthChart, playerId, position) !== null;
};

export const getUnassignedPlayersForPosition = (
  position: string,
  players: (CollegePlayer | NFLPlayer)[],
  depthChart: any,
  league: typeof SimCFB | typeof SimNFL
): (CollegePlayer | NFLPlayer)[] => {
  const assignedToThisPosition = new Set(
    (depthChart?.DepthChartPlayers || [])
      .filter((dcPlayer: any) => dcPlayer.Position === position)
      .map((dcPlayer: any) => dcPlayer.PlayerID)
  );

  const availableForPosition = filterEligiblePlayers(
    players,
    position,
    true,
    true,
    league
  );

  const filtered = availableForPosition.filter((player) => {
    const playerId = getPlayerId(player);
    return !assignedToThisPosition.has(playerId);
  });

  return filtered.sort((a, b) => {
    const aIsExactMatch = a.Position === position;
    const bIsExactMatch = b.Position === position;

    if (aIsExactMatch && !bIsExactMatch) return -1;
    if (!aIsExactMatch && bIsExactMatch) return 1;

    return sortPlayersByAttribute([a, b], league, position)[0] === a ? -1 : 1;
  });
};

export const createOpponentPlayerOptions = (
  opponentPlayers: any[] = []
): { label: string; value: number }[] => {
  const offensivePlayers = opponentPlayers
    .filter((player) =>
      ["QB", "RB", "FB", "WR", "TE"].includes(player.Position)
    )
    .sort((a, b) =>
      a.Overall === b.Overall ? 0 : a.Overall > b.Overall ? -1 : 1
    );
  return [
    { label: "None", value: -1 },
    ...offensivePlayers.map((player) => {
      return {
        label: `${player.Position} ${player.FirstName} ${player.LastName}`,
        value: player.ID,
      };
    }),
  ];
};

export const formatPositionLabel = (
  position: string,
  activeFormation: "offense" | "defense" | "specialteams"
): string => {
  if (activeFormation === "offense") {
    if (position === "OG") return "OG (LG/RG)";
    if (position === "OT") return "OT (LT/RT)";
  }
  return position;
};
