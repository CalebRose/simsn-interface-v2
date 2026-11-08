import { FC, ReactNode, useMemo, useState } from "react";
import type { Match, Team } from "../../../models/basketballModels";
import { SelectDropdown } from "../../../_design/Select";
import {
  isCBIGame,
  isNCAAGame,
  isNITGame,
  layoutBracket,
  splitRegionalTournament,
  splitTournaments,
} from "./cbbBracketLayout";
import {
  TournamentBracketView,
  TournamentEntry,
  useRevealedGames,
} from "./CBBConferenceTournamentBracket";

export interface PostseasonConfig {
  title: string;
  matches: (g: Match) => boolean;
  emptyText: string;
  winnerLabel: string;
  // Regional tournaments: one bracket per region plus the later rounds.
  regional?: {
    regionRound: string;
    regionCount: number;
    regionLabels: string[];
    finalNames: string[];
    finalLabels: string[];
    finalName: string;
  };
  // Single-bracket tournaments.
  singleLabels?: string[];
}

export const NCAA_CONFIG: PostseasonConfig = {
  title: "NCAA Tournament",
  matches: isNCAAGame,
  emptyText: "No NCAA tournament games found for this season.",
  winnerLabel: "Champion",
  regional: {
    regionRound: "Elite 8",
    regionCount: 4,
    regionLabels: ["Round of 64", "Round of 32", "Sweet 16", "Elite 8"],
    finalNames: ["Final Four", "NCAA National Championship"],
    finalLabels: ["Final Four", "National Championship"],
    finalName: "Final Four",
  },
};

export const NIT_CONFIG: PostseasonConfig = {
  title: "NIT Tournament",
  matches: isNITGame,
  emptyText: "No NIT games found for this season.",
  winnerLabel: "Champion",
  regional: {
    regionRound: "NIT Quarterfinals",
    regionCount: 4,
    regionLabels: ["First Round", "Second Round", "Quarterfinals"],
    finalNames: ["NIT Semifinals", "NIT Championship"],
    finalLabels: ["Semifinals", "Championship"],
    finalName: "Finals",
  },
};

export const CBI_CONFIG: PostseasonConfig = {
  title: "CBI Tournament",
  matches: isCBIGame,
  emptyText: "No CBI games found for this season.",
  winnerLabel: "Champion",
  singleLabels: ["First Round", "Quarterfinals", "Semifinals", "Championship"],
};

interface Props {
  config: PostseasonConfig;
  games: Match[];
  teamMap: Record<number, Team> | null;
  ts: any;
  playerMap: any;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
  topControls?: ReactNode;
}

export const CBBPostseasonBracket: FC<Props> = ({
  config,
  games: allGames,
  teamMap,
  ts,
  topControls,
  ...style
}) => {
  const matching = useMemo(
    () => allGames.filter(config.matches),
    [allGames, config],
  );
  const games = useRevealedGames(matching, ts);

  const entries = useMemo<TournamentEntry[]>(() => {
    if (!games.length) return [];
    const { regional, singleLabels } = config;

    if (!regional)
      return [
        {
          key: "main",
          name: `${config.title} Tournament`,
          games,
          roundLabels: singleLabels,
        },
      ];

    const { regions, finals } = splitRegionalTournament(
      games,
      regional.regionRound,
      regional.regionCount,
      regional.finalNames,
    );

    // Until every region's last game exists the regions can't be told apart, so
    // show each branch built so far (e.g. one Sweet 16 game and everything that
    // fed it) as its own small bracket, latest rounds first.
    if (!regions) {
      const abbr = (id: number, fallback: string) =>
        teamMap?.[id]?.Abbr || fallback;
      const branches = splitTournaments(games);
      const lone = branches.filter((b) => b.length === 1).flat();
      const entries: TournamentEntry[] = branches
        .filter((b) => b.length > 1)
        .map((branch) => {
          const root = [...branch].sort(
            (a, b) => b.Week - a.Week || b.ID - a.ID,
          )[0];
          return {
            key: `branch-${root.ID}`,
            name: `${root.MatchName}: ${abbr(root.HomeTeamID, root.HomeTeam)} vs ${abbr(root.AwayTeamID, root.AwayTeam)}`,
            games: branch,
            labelFromMatchName: true,
            sortWeek: root.Week,
            sortID: root.ID,
          };
        })
        .sort((a, b) => b.sortWeek - a.sortWeek || a.sortID - b.sortID)
        .map(({ sortWeek, sortID, ...entry }) => entry);
      if (lone.length)
        entries.push({
          key: "lone",
          name: `${lone[0].MatchName} (${lone.length} games)`,
          games: lone,
          labelFromMatchName: true,
        });
      return entries;
    }

    return [
      ...regions.map((regionGames, i) => {
        const top = Array.from(layoutBracket(regionGames).seeds.entries()).find(
          ([, seed]) => seed === 1,
        );
        const topTeam = top ? teamMap?.[top[0]]?.Abbr : undefined;
        return {
          key: `region-${i + 1}`,
          name: `Region ${i + 1}${topTeam ? ` (#1 ${topTeam})` : ""}`,
          games: regionGames,
          roundLabels: regional.regionLabels,
          buttonLabel: `Region ${i + 1}`,
        };
      }),
      {
        key: "finals",
        name: regional.finalName,
        games: finals,
        roundLabels: regional.finalLabels,
        buttonLabel: "Finals",
      },
    ];
  }, [games, teamMap, config]);

  return (
    <TournamentBracketView
      entries={entries}
      heading={(entry) =>
        `${config.title}${entry?.buttonLabel ? ` - ${entry.name}` : ""}`
      }
      placeholder={config.regional ? "Select Region..." : "Select Bracket..."}
      emptyText={config.emptyText}
      winnerLabel={config.winnerLabel}
      topControls={topControls}
      teamMap={teamMap}
      ts={ts}
      {...style}
    />
  );
};

const POSTSEASON_TOURNAMENTS = [
  { value: "ncaa", label: "NCAA Tournament", config: NCAA_CONFIG },
  { value: "nit", label: "NIT", config: NIT_CONFIG },
  { value: "cbi", label: "CBI", config: CBI_CONFIG },
];

// One page for the national tournaments: pick NCAA / NIT / CBI from a dropdown.
export const CBBPostseasonPage: FC<Omit<Props, "config" | "topControls">> = (
  props,
) => {
  const [tournament, setTournament] = useState("ncaa");
  const selected =
    POSTSEASON_TOURNAMENTS.find((t) => t.value === tournament) ??
    POSTSEASON_TOURNAMENTS[0];
  return (
    <CBBPostseasonBracket
      key={selected.value}
      config={selected.config}
      topControls={
        <div className="w-full max-w-md">
          <SelectDropdown
            options={POSTSEASON_TOURNAMENTS}
            value={POSTSEASON_TOURNAMENTS.find(
              (t) => t.value === selected.value,
            )}
            placeholder="Select Tournament..."
            onChange={(option) => setTournament(option?.value ?? "ncaa")}
          />
        </div>
      }
      {...props}
    />
  );
};
