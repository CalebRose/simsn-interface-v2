import { FC, Fragment, KeyboardEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { PageContainer } from "../../../../_design/Container";
import { SkeletonRows } from "../../../../_design/SkeletonRows";
import { SimMLB } from "../../../../_constants/constants";
import { useSimBaseballStore } from "../../../../context/SimBaseballContext";
import { useAuthStore } from "../../../../context/AuthContext";
import { useModal } from "../../../../_hooks/useModal";
import { BaseballService } from "../../../../_services/baseballService";
import { getLogo } from "../../../../_utility/getLogo";
import { isBrightColor } from "../../../../_utility/isBrightColor";
import { ScoutingBudget } from "../../../../models/baseball/baseballScoutingModels";
import type {
  AwardHistoryChampion,
  AwardHistorySeason,
  AwardHistoryWinner,
  AwardsHistoryResponse,
  AwardTeam,
  AwardType,
} from "../../../../models/baseball/baseballStatsModels";
import { SportBannerSections, useSportSectionTab } from "../../../Common/SportBanner";
import { SportChip, SportPanel, SportSegmented } from "../../../Common/SportKit";
import { PlayerModal } from "../PlayerModal";
import {
  awardKind,
  awardShortName,
  comparePositions,
  useAwardsHistory,
} from "./awardsDisplay";

// ═══════════════════════════════════════════════
// MLB Awards History — one GET /awards/history call drives every section.
// Always iterate award_types (display order); season buckets are keyed
// alphabetically and a missing key means nobody won that award that season.
// ═══════════════════════════════════════════════

type Section = "winners" | "positional" | "champions" | "leaders";

const SECTIONS: ReadonlyArray<readonly [Section, string]> = [
  ["winners", "Winners"],
  ["positional", "Positional"],
  ["champions", "Champions"],
  ["leaders", "Leaders"],
];

// Table look shared with the volleyball pages. data-keep-table stops the
// global rule that turns tables into stacked cards below 900px.
const tableClass = "w-full text-left text-sm";
const headClass =
  "border-b border-(--sport-divider) text-[0.7rem] uppercase tracking-wider text-(--text-muted)";
const rowClass =
  "border-b border-(--sport-divider) last:border-0 hover:bg-(--text-primary)/5 align-top";
const cell = "px-2 py-1.5 whitespace-nowrap";
const num = `${cell} text-right tabular-nums`;
const stickyCell =
  "sticky left-0 z-[1] bg-(--sport-surface) shadow-[2px_0_4px_-2px_rgba(0,0,0,0.25)]";
const groupHead =
  "px-2 py-1 text-center text-[10px] font-bold tracking-wider border-l border-(--sport-divider)";
const muted = "text-(--text-muted)";

type League = "AL" | "NL" | null;
const leaguesOf = (t: AwardType): League[] => (t.has_league_split ? ["AL", "NL"] : [null]);

// ── Small parts ─────────────────────────────────

const linkProps = (onActivate: () => void) => ({
  role: "link",
  tabIndex: 0,
  onClick: onActivate,
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") onActivate();
  },
});

/** Team abbreviation tinted with the team's primary colour. */
const TeamChip: FC<{ team: AwardTeam | null | undefined }> = ({ team }) => {
  if (!team) return null;
  const bg = team.color_one || undefined;
  const fg = bg ? (isBrightColor(bg) ? "#111827" : "#ffffff") : undefined;
  return (
    <span
      className={`inline-block rounded px-1 py-px text-[0.65rem] font-semibold leading-tight ${
        bg ? "" : "bg-(--sport-surface-2) text-(--text-muted)"
      }`}
      style={bg ? { backgroundColor: bg, color: fg } : undefined}
      title={[team.team_city, team.team_name].filter(Boolean).join(" ") || undefined}
    >
      {team.team_abbrev}
    </span>
  );
};

const TeamWithLogo: FC<{ team: AwardTeam; bold?: boolean }> = ({ team, bold }) => {
  const { currentUser } = useAuthStore();
  return (
    <span className="inline-flex items-center gap-1.5">
      <img
        src={getLogo(SimMLB, team.team_id, currentUser?.IsRetro)}
        alt=""
        className="h-5 w-5 object-contain"
        onError={(event) => {
          (event.target as HTMLImageElement).style.visibility = "hidden";
        }}
      />
      <span className={bold ? "font-semibold" : ""}>{team.team_abbrev}</span>
    </span>
  );
};

const PlayerLink: FC<{
  playerId: number;
  name: string;
  onOpen: (playerId: number) => void;
  classes?: string;
}> = ({ playerId, name, onOpen, classes = "" }) => (
  <span
    {...linkProps(() => onOpen(playerId))}
    className={`cursor-pointer font-semibold transition-colors hover:text-(--accent-primary) ${classes}`}
  >
    {name}
  </span>
);

/** One winner: name, team chip, and "(2)" when it is the player's 2nd win. */
const WinnerCell: FC<{
  winner: AwardHistoryWinner | undefined;
  nth: Map<number, number>;
  onOpen: (playerId: number) => void;
}> = ({ winner, nth, onOpen }) => {
  if (!winner) return <span className={muted}>—</span>;
  const n = nth.get(winner.award_id) ?? 1;
  return (
    <span className="inline-flex items-center gap-1.5">
      <PlayerLink playerId={winner.player_id} name={winner.name} onOpen={onOpen} />
      {n > 1 && (
        <span className={`text-[0.7rem] ${muted}`} title={`Win #${n}`}>
          ({n})
        </span>
      )}
      <TeamChip team={winner.team} />
    </span>
  );
};

const Empty: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={`p-6 text-center text-sm ${muted}`}>{children}</div>
);

// ── Derived data ────────────────────────────────

/**
 * award_id → which win this is for that player and award, counted oldest
 * season first (a repeat winner reads "(2)", "(3)"…).
 */
const useWinOrdinals = (seasons: AwardHistorySeason[]) =>
  useMemo(() => {
    const counts = new Map<string, number>();
    const nth = new Map<number, number>();
    for (const season of [...seasons].reverse()) {
      for (const [code, winners] of Object.entries(season.individual)) {
        for (const w of winners) {
          if (!w.is_winner) continue;
          const key = `${code}:${w.position_code ?? ""}:${w.player_id}`;
          const n = (counts.get(key) ?? 0) + 1;
          counts.set(key, n);
          nth.set(w.award_id, n);
        }
      }
    }
    return nth;
  }, [seasons]);

const findWinner = (
  season: AwardHistorySeason,
  code: string,
  league: League,
  position: string | null = null,
) =>
  season.individual[code]?.find(
    (w) =>
      w.is_winner &&
      (league === null || w.sub_league === league) &&
      (position === null || w.position_code === position),
  );

// ── Sections ────────────────────────────────────

const WinnersSection: FC<{
  data: AwardsHistoryResponse;
  onOpen: (playerId: number) => void;
}> = ({ data, onOpen }) => {
  // Per-position awards have their own section; they would add 30+ columns here.
  const types = data.award_types.filter(
    (t) => awardKind(t) === "individual" && !t.is_per_position,
  );
  const [picked, setPicked] = useState<string>("all");
  const shown = picked === "all" ? types : types.filter((t) => t.code === picked);
  const nth = useWinOrdinals(data.seasons);
  // With one award picked, skip the seasons nobody won it.
  const seasons = data.seasons.filter((s) => shown.some((t) => s.individual[t.code]?.length));

  return (
    <SportPanel
      title="Season winners"
      actions={
        types.length > 1 && (
          <SportSegmented
            label="Award"
            value={picked}
            onChange={setPicked}
            options={[
              ["all", "All"] as const,
              ...types.map((t) => [t.code, awardShortName(t)] as const),
            ]}
          />
        )
      }
    >
      {seasons.length === 0 ? (
        <Empty>No awards have been handed out yet.</Empty>
      ) : (
        <table data-keep-table className={tableClass}>
          <thead className={headClass}>
            <tr>
              <th rowSpan={2} className={`${cell} ${stickyCell}`}>
                Season
              </th>
              {shown.map((t) => (
                <th key={t.code} colSpan={leaguesOf(t).length} className={groupHead} title={t.name}>
                  {awardShortName(t)}
                </th>
              ))}
            </tr>
            <tr>
              {shown.map((t) =>
                leaguesOf(t).map((lg) => (
                  <th key={`${t.code}:${lg}`} className={`${cell} border-l border-(--sport-divider)`}>
                    {lg ?? "MLB"}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => (
              <tr key={s.league_year_id} className={rowClass}>
                <td className={`${cell} ${stickyCell} font-semibold`}>{s.league_year}</td>
                {shown.map((t) =>
                  leaguesOf(t).map((lg) => (
                    <td key={`${t.code}:${lg}`} className={`${cell} border-l border-(--sport-divider)`}>
                      <WinnerCell winner={findWinner(s, t.code, lg)} nth={nth} onOpen={onOpen} />
                    </td>
                  )),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SportPanel>
  );
};

const PositionalSection: FC<{
  data: AwardsHistoryResponse;
  onOpen: (playerId: number) => void;
}> = ({ data, onOpen }) => {
  const types = data.award_types.filter(
    (t) => awardKind(t) === "individual" && t.is_per_position,
  );
  const [picked, setPicked] = useState<string | null>(null);
  const type = types.find((t) => t.code === picked) ?? types[0];
  const nth = useWinOrdinals(data.seasons);

  // Rows are the positions actually entered (admin-entered; e.g. no DH yet).
  const seasons = type ? data.seasons.filter((s) => s.individual[type.code]?.length) : [];
  const positions = useMemo(() => {
    if (!type) return [];
    const set = new Set<string>();
    for (const s of seasons)
      for (const w of s.individual[type.code] ?? []) if (w.position_code) set.add(w.position_code);
    return [...set].sort(comparePositions);
  }, [type, seasons]);

  if (!type) return <SportPanel title="Positional awards"><Empty>No positional awards.</Empty></SportPanel>;
  const leagues = leaguesOf(type);

  return (
    <SportPanel
      title={type.name}
      actions={
        types.length > 1 && (
          <SportSegmented
            label="Award"
            value={type.code}
            onChange={setPicked}
            options={types.map((t) => [t.code, t.name] as const)}
          />
        )
      }
    >
      {seasons.length === 0 ? (
        <Empty>No {type.name} winners yet.</Empty>
      ) : (
        <table data-keep-table className={tableClass}>
          <thead className={headClass}>
            <tr>
              <th rowSpan={2} className={`${cell} ${stickyCell}`}>
                Pos
              </th>
              {seasons.map((s) => (
                <th key={s.league_year_id} colSpan={leagues.length} className={groupHead}>
                  {s.league_year}
                </th>
              ))}
            </tr>
            <tr>
              {seasons.map((s) =>
                leagues.map((lg) => (
                  <th key={`${s.league_year_id}:${lg}`} className={`${cell} border-l border-(--sport-divider)`}>
                    {lg ?? "MLB"}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos} className={rowClass}>
                <td className={`${cell} ${stickyCell} font-semibold`}>{pos}</td>
                {seasons.map((s) =>
                  leagues.map((lg) => (
                    <td key={`${s.league_year_id}:${lg}`} className={`${cell} border-l border-(--sport-divider)`}>
                      <WinnerCell winner={findWinner(s, type.code, lg, pos)} nth={nth} onOpen={onOpen} />
                    </td>
                  )),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SportPanel>
  );
};

const ChampionCell: FC<{ champ: AwardHistoryChampion | undefined }> = ({ champ }) => {
  if (!champ) return <span className={muted}>—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <TeamWithLogo team={champ.team} bold />
      {champ.opponent && (
        <span className={`text-xs ${muted}`}>
          def. {champ.opponent.team_abbrev}
          {champ.series_result ? ` ${champ.series_result}` : ""}
        </span>
      )}
    </div>
  );
};

const ChampionsSection: FC<{ data: AwardsHistoryResponse }> = ({ data }) => {
  // World Series first, then pennants: championship types in display order.
  const types = data.award_types.filter((t) => awardKind(t) === "championship");
  const seasons = data.seasons.filter((s) => types.some((t) => s.championships[t.code]?.length));
  const teams = data.leaders.teams;

  if (types.length === 0) return <SportPanel title="Champions"><Empty>No championships recorded.</Empty></SportPanel>;

  return (
    <div className="space-y-3">
      <SportPanel title="Champions by season">
        {seasons.length === 0 ? (
          <Empty>No postseason has been completed yet.</Empty>
        ) : (
          <table data-keep-table className={`${tableClass} min-w-[480px]`}>
            <thead className={headClass}>
              <tr>
                <th className={`${cell} ${stickyCell}`}>Season</th>
                {types.map((t) =>
                  leaguesOf(t).map((lg) => (
                    <th key={`${t.code}:${lg}`} className={cell}>
                      {lg ? `${lg} ${awardShortName(t)}` : awardShortName(t)}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.league_year_id} className={rowClass}>
                  <td className={`${cell} ${stickyCell} font-semibold`}>{s.league_year}</td>
                  {types.map((t) =>
                    leaguesOf(t).map((lg) => (
                      <td key={`${t.code}:${lg}`} className={cell}>
                        <ChampionCell
                          champ={s.championships[t.code]?.find(
                            (c) => lg === null || c.sub_league === lg,
                          )}
                        />
                      </td>
                    )),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SportPanel>

      {teams.length > 0 && (
        <SportPanel title="Most titles">
          <table data-keep-table className={`${tableClass} min-w-[420px]`}>
            <thead className={headClass}>
              <tr>
                <th className={cell}>Team</th>
                {types.map((t) => (
                  <th key={t.code} className={cell}>
                    {awardShortName(t)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.team_id} className={rowClass}>
                  <td className={cell}>
                    <TeamWithLogo team={team} bold />
                  </td>
                  {types.map((t) => {
                    const title = team.titles[t.code];
                    return (
                      <td key={t.code} className={cell}>
                        {title?.count ? (
                          <>
                            <span className="font-semibold tabular-nums">{title.count}</span>
                            <span className={`ml-1.5 text-xs ${muted}`}>
                              ({[...title.years].sort((a, b) => a - b).join(", ")})
                            </span>
                          </>
                        ) : (
                          <span className={muted}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </SportPanel>
      )}
    </div>
  );
};

const LeadersSection: FC<{
  data: AwardsHistoryResponse;
  onOpen: (playerId: number) => void;
}> = ({ data, onOpen }) => {
  const players = data.leaders.players;
  // Trophy badges in display order; All-Star has its own column.
  const trophyTypes = data.award_types.filter((t) => awardKind(t) === "individual");

  return (
    <SportPanel title="Most decorated players">
      {players.length === 0 ? (
        <Empty>No awards have been handed out yet.</Empty>
      ) : (
        <table data-keep-table className={`${tableClass} min-w-[560px]`}>
          <thead className={headClass}>
            <tr>
              <th className={num}>#</th>
              <th className={cell}>Player</th>
              <th className={num} title="Individual award wins">
                Trophies
              </th>
              <th className={num} title="All-Star selections">
                All-Star
              </th>
              <th className={cell}>Awards</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.player_id} className={rowClass}>
                <td className={`${num} ${muted}`}>{i + 1}</td>
                <td className={cell}>
                  <PlayerLink playerId={p.player_id} name={p.name} onOpen={onOpen} />
                  {p.ptype && (
                    <span className={`ml-1.5 text-xs ${muted}`}>
                      {p.ptype === "Pitcher" ? "P" : "Pos"}
                    </span>
                  )}
                </td>
                <td className={`${num} font-semibold`}>{p.trophies}</td>
                <td className={num}>{p.selections || <span className={muted}>—</span>}</td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {trophyTypes
                      .filter((t) => p.awards[t.code]?.wins)
                      .map((t) => {
                        const a = p.awards[t.code];
                        return (
                          <span key={t.code} title={`${t.name}: ${[...a.years].sort((x, y) => x - y).join(", ")}`}>
                            <SportChip>
                              {a.wins > 1 ? `${a.wins}× ` : ""}
                              {awardShortName(t)}
                            </SportChip>
                          </span>
                        );
                      })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SportPanel>
  );
};

// ── Page ────────────────────────────────────────

export const BaseballAwardsPage: FC = () => {
  const { seasonContext, mlbOrganization } = useSimBaseballStore();
  const [section, setSection] = useSportSectionTab(SECTIONS, "winners");
  const { data, loading, error } = useAwardsHistory();

  // Player modal: clicking any name opens the usual scouting-aware modal on
  // its Awards tab. Ratings use the CURRENT league year (fog of war), not the
  // award season's.
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(null);
  const orgId = mlbOrganization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  const refreshBudget = useCallback(() => {
    if (orgId && leagueYearId) {
      BaseballService.GetScoutingBudget(orgId, leagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
  }, [orgId, leagueYearId]);
  useEffect(() => {
    refreshBudget();
  }, [refreshBudget]);

  const openPlayer = useCallback(
    (playerId: number) => {
      setModalPlayerId(playerId);
      handleOpenModal();
    },
    [handleOpenModal],
  );

  let body: ReactNode;
  if (loading) body = <SkeletonRows count={8} classes="p-2" />;
  else if (error || !data)
    body = (
      <SportPanel>
        <Empty>{error ?? "Awards history is not available."}</Empty>
      </SportPanel>
    );
  else
    body = (
      <Fragment>
        {section === "winners" && <WinnersSection data={data} onOpen={openPlayer} />}
        {section === "positional" && <PositionalSection data={data} onOpen={openPlayer} />}
        {section === "champions" && <ChampionsSection data={data} />}
        {section === "leaders" && <LeadersSection data={data} onOpen={openPlayer} />}
      </Fragment>
    );

  return (
    <PageContainer>
      <div className="flex w-[95vw] flex-col gap-2 px-2 sm:w-[90vw] md:mb-6 md:w-full">
        <SportBannerSections tabs={SECTIONS} value={section} onChange={setSection} />
        {body}
      </div>

      {modalPlayerId != null && (
        <PlayerModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalPlayerId(null);
            handleCloseModal();
          }}
          playerId={modalPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={refreshBudget}
          league={SimMLB}
          context="scouting"
          initialTab="Awards"
        />
      )}
    </PageContainer>
  );
};
