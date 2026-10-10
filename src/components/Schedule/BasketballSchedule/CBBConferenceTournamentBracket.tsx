import {
  CSSProperties,
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Logo } from "../../../_design/Logo";
import { SelectDropdown } from "../../../_design/Select";
import { Text } from "../../../_design/Typography";
import { League, SimCBB } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useModal } from "../../../_hooks/useModal";
import { RevealBBAResults } from "../../../_helper/teamHelper";
import { CollegeStandings, Match, Team } from "../../../models/basketballModels";
import { processWeeklyGames } from "../Common/SchedulePageHelper";
import { SchedulePageGameModal } from "../Common/GameModal";
import {
  BracketLayout,
  layoutBracket,
  splitTournaments,
} from "./cbbBracketLayout";

interface BracketProps {
  games: Match[];
  standings: CollegeStandings[];
  season: number;
  teamMap: Record<number, Team> | null;
  defaultConferenceId?: number;
  ts: any;
  playerMap: any;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
}

const CARD_W = 220;
const COL_GAP = 40;
const ROW_H = 32;
// two rows + 1px divider + 2px border
const CARD_H = ROW_H * 2 + 3;
const PITCH = CARD_H + 10;
const HEADER_H = 40;

const roundName = (roundCount: number, round: number) => {
  const remaining = roundCount - round;
  if (remaining === 0) return "Final";
  if (remaining === 1) return "Semifinals";
  if (remaining === 2) return "Quarterfinals";
  if (round === 1) return "First Round";
  if (round === 2) return "Second Round";
  return `Round ${round}`;
};

const TeamRow: FC<{
  game: Match;
  home: boolean;
  team?: Team;
  seed?: number;
  league: League;
}> = ({ game, home, team, seed, league }) => {
  const teamID = home ? game.HomeTeamID : game.AwayTeamID;
  const score = home ? game.HomeTeamScore : game.AwayTeamScore;
  const won = home ? game.HomeTeamWin : game.AwayTeamWin;
  return (
    <div
      className={`grid shrink-0 grid-cols-[16px_24px_minmax(0,1fr)_32px] items-center gap-1.5 px-2 ${
        game.GameComplete && !won ? "opacity-60" : ""
      }`}
      style={{ height: ROW_H }}
    >
      <span className="text-xs font-semibold text-slate-400">{seed ?? ""}</span>
      <Logo url={getLogo(league, teamID, false)} variant="tiny" />
      <span className="truncate text-sm font-semibold">
        {team?.Abbr || (home ? game.HomeTeam : game.AwayTeam)}
      </span>
      <span className="text-right font-bold">
        {game.GameComplete || score > 0 ? score : ""}
      </span>
    </div>
  );
};

const BracketCanvas: FC<{
  layout: BracketLayout;
  teamMap: Record<number, Team> | null;
  onGame?: (game: Match) => void;
  roundLabels?: string[];
  labelFromMatchName?: boolean;
  winnerLabel?: string;
  hideWinner?: boolean;
  league: League;
}> = ({
  layout,
  teamMap,
  onGame,
  roundLabels,
  labelFromMatchName,
  winnerLabel = "Winner",
  hideWinner,
  league,
}) => {
  const { roundCount, nodes, minGap, seeds } = layout;
  const unit = PITCH / minGap;
  const ys = nodes.map((n) => n.y);
  const minY = Math.min(...ys);
  const colX = (round: number) => (round - 1) * (CARD_W + COL_GAP);
  const centre = (y: number) => (y - minY) * unit + CARD_H / 2;
  const height = (Math.max(...ys) - minY) * unit + CARD_H;
  const columnCount = roundCount + (hideWinner ? 0 : 1);
  const width = columnCount * (CARD_W + COL_GAP) - COL_GAP;
  const byID = new Map(nodes.map((n) => [n.game.ID, n]));
  const final = nodes.find((n) => n.round === roundCount);
  const champion = !hideWinner && final?.game.GameComplete
    ? final.game.HomeTeamWin
      ? final.game.HomeTeamID
      : final.game.AwayTeamID
    : undefined;

  const columns = [
    ...Array.from(
      { length: roundCount },
      (_, i) =>
        roundLabels?.[i] ??
        (labelFromMatchName
          ? nodes
              .find((n) => n.round === i + 1)
              ?.game.MatchName?.replace(/^(NIT|CBI|NCAA) /, "")
          : undefined) ??
        roundName(roundCount, i + 1),
    ),
    ...(hideWinner ? [] : [winnerLabel]),
  ];

  return (
    <div className="pb-3">
      <div
        className="relative mx-auto"
        style={{ width, height: height + HEADER_H }}
      >
        {columns.map((label, i) => (
          <div
            key={label}
            className="absolute text-center font-bold"
            style={{ left: i * (CARD_W + COL_GAP), width: CARD_W, top: 0 }}
          >
            {label}
          </div>
        ))}
        <svg
          className="pointer-events-none absolute left-0"
          style={{ top: HEADER_H }}
          width={width}
          height={height}
        >
          {nodes.map((n) => {
            const parent = n.parentID ? byID.get(n.parentID) : undefined;
            const x1 = colX(n.round) + CARD_W;
            const y1 = centre(n.y);
            if (!parent) {
              if (n.round !== roundCount || hideWinner) return null;
              return (
                <path
                  key={n.game.ID}
                  d={`M${x1} ${y1} H${x1 + COL_GAP}`}
                  stroke="#64748b"
                  fill="none"
                />
              );
            }
            const x2 = colX(parent.round);
            const y2 = centre(parent.y) + (n.side === 0 ? -ROW_H / 2 : ROW_H / 2);
            const xm = x1 + COL_GAP / 2;
            return (
              <path
                key={n.game.ID}
                d={`M${x1} ${y1} H${xm} V${y2} H${x2}`}
                stroke="#64748b"
                fill="none"
              />
            );
          })}
        </svg>
        <div className="absolute left-0" style={{ top: HEADER_H }}>
          {nodes.map((n) => (
            <div
              key={n.game.ID}
              role="button"
              onClick={() => onGame && n.game.GameComplete && onGame(n.game)}
              className={`absolute flex flex-col justify-start overflow-hidden rounded border border-slate-500 bg-slate-800 text-left ${
                onGame && n.game.GameComplete
                  ? "cursor-pointer"
                  : "cursor-default"
              }`}
              style={{
                left: colX(n.round),
                top: centre(n.y) - CARD_H / 2,
                width: CARD_W,
                height: CARD_H,
              }}
            >
              <TeamRow
                game={n.game}
                home
                team={teamMap?.[n.game.HomeTeamID]}
                seed={seeds.get(n.game.HomeTeamID)}
                league={league}
              />
              <div className="border-t border-slate-600" />
              <TeamRow
                game={n.game}
                home={false}
                team={teamMap?.[n.game.AwayTeamID]}
                seed={seeds.get(n.game.AwayTeamID)}
                league={league}
              />
            </div>
          ))}
          {champion && final && (
            <div
              className="absolute flex items-center gap-2 rounded border border-yellow-500 bg-slate-800 px-3 font-bold"
              style={{
                left: colX(roundCount + 1),
                top: centre(final.y) - ROW_H / 2,
                width: CARD_W,
                height: ROW_H,
              }}
            >
              <Logo url={getLogo(league, champion, false)} variant="tiny" />
              <span className="truncate">
                {teamMap?.[champion]?.Abbr ||
                  (final.game.HomeTeamWin
                    ? final.game.HomeTeam
                    : final.game.AwayTeam)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface TournamentEntry {
  key: string;
  name: string;
  games: Match[];
  roundLabels?: string[];
  labelFromMatchName?: boolean;
  // When any entry has a button label, entries are switched with a row of
  // buttons instead of a dropdown.
  buttonLabel?: string;
  // Series / play-in entries: no per-game box score, no champion column.
  noClick?: boolean;
  hideWinner?: boolean;
  layout?: BracketLayout;
  // Extra brackets shown under this one on the same page (e.g. play-in).
  below?: TournamentEntry[];
}

// Hide results the schedule page hasn't revealed yet, including the winner,
// so a live tournament can't be read ahead of the sim timeslots.
export const useRevealedGames = (games: Match[], ts: any) =>
  useMemo(
    () =>
      games.map((g) =>
        RevealBBAResults(g, ts, false)
          ? g
          : (Object.assign(Object.create(Object.getPrototypeOf(g)), g, {
              GameComplete: false,
              HomeTeamWin: false,
              AwayTeamWin: false,
              HomeTeamScore: 0,
              AwayTeamScore: 0,
            }) as Match),
      ),
    [games, ts],
  );

interface ViewProps {
  entries: TournamentEntry[];
  defaultKey?: string;
  heading: (entry?: TournamentEntry) => string;
  placeholder: string;
  emptyText: string;
  winnerLabel?: string;
  topControls?: ReactNode;
  league?: League;
  teamMap: Record<number, Team> | null;
  ts: any;
  playerMap: any;
  backgroundColor: string;
  headerColor: string;
  borderColor: string;
  textColorClass: string;
}

export const TournamentBracketView: FC<ViewProps> = ({
  entries,
  defaultKey,
  heading,
  placeholder,
  emptyText,
  winnerLabel,
  topControls,
  league = SimCBB,
  teamMap,
  ts,
  playerMap,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
}) => {
  const gameModal = useModal();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const useButtons = entries.some((e) => e.buttonLabel);

  useEffect(() => {
    if (entries.some((e) => e.key === selectedKey)) return;
    const preferred = entries.find((e) => e.key === defaultKey);
    setSelectedKey((preferred ?? entries[0])?.key);
  }, [entries, selectedKey, defaultKey]);

  const entry = entries.find((e) => e.key === selectedKey);
  const layout = useMemo(
    () =>
      entry && (entry.layout || entry.games.length)
        ? (entry.layout ?? layoutBracket(entry.games))
        : undefined,
    [entry],
  );
  const options = entries.map((e) => ({ value: e.key, label: e.name }));
  const belowLayouts = useMemo(
    () =>
      (entry?.below ?? []).map((b) => ({
        entry: b,
        layout: b.layout ?? layoutBracket(b.games),
      })),
    [entry],
  );

  const openBoxScore = (game: Match) => {
    const [processed] = processWeeklyGames(
      [
        {
          ...game,
          HomeTeamAbbr: teamMap?.[game.HomeTeamID]?.Abbr,
          AwayTeamAbbr: teamMap?.[game.AwayTeamID]?.Abbr,
        },
      ],
      ts,
      league,
      true,
    );
    setSelectedGame(processed);
    gameModal.handleOpenModal();
  };

  const headerStyle: CSSProperties = {
    backgroundColor: headerColor,
    borderColor,
  };

  return (
    <Border
      classes="h-full overflow-auto p-4 col-span-5"
      styles={{ borderColor, backgroundColor }}
    >
      <SchedulePageGameModal
        isOpen={gameModal.isModalOpen}
        onClose={gameModal.handleCloseModal}
        league={league}
        game={selectedGame}
        title={`${selectedGame?.HomeTeamAbbr} vs ${selectedGame?.AwayTeamAbbr}`}
        playerMap={playerMap}
        teamMap={teamMap}
      />
      <h2
        className={`rounded px-4 py-2 text-center text-xl font-bold ${textColorClass}`}
        style={headerStyle}
      >
        {heading(entry)}
      </h2>
      <div className="mx-auto my-4 flex max-w-2xl flex-col items-center gap-3">
        {topControls}
        {useButtons && entries.length > 1 && (
          <ButtonGroup classes="justify-center">
            {entries.map((e) => (
              <Button
                key={e.key}
                size="md"
                variant="primary"
                isSelected={e.key === selectedKey}
                classes="px-4 py-2"
                onClick={() => setSelectedKey(e.key)}
              >
                <Text variant="small">{e.buttonLabel ?? e.name}</Text>
              </Button>
            ))}
          </ButtonGroup>
        )}
        {!useButtons && entries.length > 1 && (
          <div className="w-full max-w-md">
            <SelectDropdown
              isSearchable
              options={options}
              value={options.find((o) => o.value === selectedKey)}
              placeholder={placeholder}
              onChange={(option) => setSelectedKey(option?.value)}
            />
          </div>
        )}
      </div>
      {!layout && !belowLayouts.length && (
        <div className="mt-6 text-center">
          <Text variant="body">{emptyText}</Text>
        </div>
      )}
      {layout && (
        <BracketCanvas
          layout={layout}
          teamMap={teamMap}
          onGame={entry?.noClick ? undefined : openBoxScore}
          league={league}
          hideWinner={entry?.hideWinner}
          roundLabels={entry?.roundLabels}
          labelFromMatchName={entry?.labelFromMatchName}
          winnerLabel={winnerLabel}
        />
      )}
      {belowLayouts.map(({ entry: b, layout: bl }) => (
          <div key={b.key} className="mt-6">
            <h3 className="mb-2 text-center text-lg font-bold">{b.name}</h3>
            <BracketCanvas
              layout={bl}
              teamMap={teamMap}
              onGame={b.noClick ? undefined : openBoxScore}
              league={league}
              hideWinner={b.hideWinner}
              roundLabels={b.roundLabels}
              labelFromMatchName={b.labelFromMatchName}
              winnerLabel={winnerLabel}
            />
          </div>
        ))}
    </Border>
  );
};

export const CBBConferenceTournamentBracket: FC<BracketProps> = ({
  games: allGames,
  standings,
  season,
  teamMap,
  defaultConferenceId,
  ts,
  playerMap,
  backgroundColor,
  headerColor,
  borderColor,
  textColorClass,
}) => {
  const games = useRevealedGames(allGames, ts);

  const entries = useMemo(() => {
    // Conference membership changes between seasons, so use that season's
    // standings when we have them and only fall back to today's team data.
    const seasonConf = new Map<number, { id: number; name: string }>();
    standings
      .filter((s) => s.Season === season)
      .forEach((s) =>
        seasonConf.set(s.TeamID, { id: s.ConferenceID, name: s.ConferenceName }),
      );
    const confOf = (teamID: number) => {
      const fromSeason = seasonConf.get(teamID);
      if (fromSeason) return fromSeason;
      const team = teamMap?.[teamID];
      return team ? { id: team.ConferenceID, name: team.Conference } : undefined;
    };

    // Each tournament is the set of games linked by who advances; name it for
    // the conference most of its teams belong to.
    const labelled = splitTournaments(games).map((group) => {
      const votes = new Map<number, { name: string; count: number }>();
      group.forEach((g) =>
        [g.HomeTeamID, g.AwayTeamID].forEach((id) => {
          const conf = confOf(id);
          if (!conf) return;
          const vote = votes.get(conf.id) || { name: conf.name, count: 0 };
          vote.count++;
          votes.set(conf.id, vote);
        }),
      );
      const [id, top] = Array.from(votes.entries()).sort(
        (a, b) => b[1].count - a[1].count,
      )[0] ?? [-1, { name: "Unknown", count: 0 }];
      return { id, name: top.name, games: group };
    });

    // Fragments (e.g. a lone game with no links) join the main tournament of
    // their conference; any other repeats stay separate and get numbered.
    const merged = new Map<number, { id: number; name: string; games: Match[] }[]>();
    [...labelled]
      .sort((a, b) => b.games.length - a.games.length)
      .forEach((t) => {
        const list = merged.get(t.id) || [];
        if (list.length && t.games.length === 1) list[0].games.push(...t.games);
        else list.push({ ...t });
        merged.set(t.id, list);
      });

    return Array.from(merged.values())
      .flatMap((list) =>
        list.map((t, i) => ({
          key: i === 0 ? String(t.id) : `${t.id}-${i + 1}`,
          name: i === 0 ? t.name : `${t.name} (${i + 1})`,
          games: t.games,
          confID: t.id,
        })),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [games, teamMap, standings, season]);

  return (
    <TournamentBracketView
      entries={entries}
      defaultKey={
        entries.find((e) => e.confID === defaultConferenceId)?.key
      }
      heading={(entry) => `${entry?.name || "Conference"} Tournament`}
      placeholder="Select Conference..."
      emptyText="No conference tournament games found for this season."
      teamMap={teamMap}
      ts={ts}
      playerMap={playerMap}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
      borderColor={borderColor}
      textColorClass={textColorClass}
    />
  );
};
