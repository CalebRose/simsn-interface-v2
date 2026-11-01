import { CSSProperties, useEffect, useMemo, useState } from "react";
import { CSSObjectWithLabel, StylesConfig } from "react-select";
import { Border } from "../../_design/Borders";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { LacrosseService, LaxScheduleResponse, LaxTeam, LaxWeeklyGame } from "../../_services/lacrosseService";
import { LaxCoachLink, LaxTeamLink, linkProps } from "./LaxTeamLink";

interface Props {
  schedule: LaxScheduleResponse;
  teams: LaxTeam[];
  weekly: boolean;
  week: number;
  primary: string;
  headerStyle: CSSProperties;
  onBoxScore: (gameId: number) => void;
}

const control = (provided: CSSObjectWithLabel, state: { isFocused: boolean }): CSSObjectWithLabel => ({
    ...provided,
    minHeight: "48px",
    width: "100%",
    maxWidth: "none",
    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
    borderRadius: "8px",
});
const multiStyles: StylesConfig<SelectOption, true> = { control };

export const CollegeLacrosseAdvancedSchedule = ({ schedule, teams, weekly, week, primary, headerStyle, onBoxScore }: Props) => {
  const [conferenceIds, setConferenceIds] = useState<number[]>([]);
  const [teamIds, setTeamIds] = useState<number[]>([]);
  const [weekGames, setWeekGames] = useState<LaxWeeklyGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!weekly) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    LacrosseService.getWeeklySchedule(schedule.selectedSeason, week)
      .then((response) => { if (!cancelled) setWeekGames(response.games); })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Weekly games could not be loaded."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [weekly, schedule.selectedSeason, week]);

  // The team schedule already carries every game for the selected team, so it
  // is reshaped into the league-wide game format instead of being refetched.
  const teamGames = useMemo<LaxWeeklyGame[]>(
    () => schedule.games.map((game) => ({
      id: game.id,
      season: game.season,
      week: game.week,
      gameContext: game.gameContext,
      status: game.status,
      homeTeam: game.isHome ? schedule.team : game.opponent,
      awayTeam: game.isHome ? game.opponent : schedule.team,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      gameName: game.gameName,
      isNeutral: game.isNeutral,
      isConferenceGame: game.isConferenceGame,
      isCt: game.gameType === "Conference Tournament",
      isNt: game.gameType === "National Tournament",
    })),
    [schedule],
  );

  const conferenceOptions = useMemo(() => {
    const seen = new Map<number, string>();
    teams.forEach((team) => {
      if (team.conference) seen.set(team.conference.id, team.conference.abbreviation || team.conference.name);
    });
    return [...seen].map(([id, label]) => ({ value: String(id), label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [teams]);
  const teamOptions = useMemo(
    () => teams.map((team) => ({ value: String(team.id), label: `${team.name} | ${team.abbreviation}` })),
    [teams],
  );

  const filteredGames = useMemo(() => {
    if (!weekly) return [...teamGames].sort((a, b) => a.week - b.week || a.id - b.id);
    const teamSet = new Set(teamIds);
    const conferenceSet = new Set(conferenceIds);
    return weekGames
      .filter((game) => {
        if (teamSet.size > 0 && !teamSet.has(game.homeTeam.id) && !teamSet.has(game.awayTeam.id)) return false;
        if (
          conferenceSet.size > 0 &&
          !conferenceSet.has(game.homeTeam.conference?.id ?? -1) &&
          !conferenceSet.has(game.awayTeam.conference?.id ?? -1)
        )
          return false;
        return true;
      })
      .sort((a, b) => a.id - b.id);
  }, [weekly, teamGames, weekGames, teamIds, conferenceIds]);

  const score = (game: LaxWeeklyGame, isFinal: boolean, value?: number) =>
    isFinal ? (
      <span {...linkProps(() => onBoxScore(game.id))} className="cursor-pointer font-semibold transition-colors hover:text-[#fcd53f]" title="View box score" aria-label="View box score">{value}</span>
    ) : "—";

  const header = weekly ? `Advanced Schedule View | Week ${week}` : `${schedule.team.abbreviation || schedule.team.name} Advanced Schedule View`;
  const showLoading = weekly && loading;
  const showError = weekly ? error : "";

  return (
    <Border classes="overflow-hidden p-4 lg:col-span-2" styles={{ borderColor: primary }}>
      <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={headerStyle}>{header}</h2>
      {weekly && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="text-center font-semibold">Conferences<div className="mt-2"><SelectDropdown isMulti isSearchable styles={multiStyles} options={conferenceOptions} placeholder="All Conferences" onChange={(options) => setConferenceIds(options.map((option) => Number(option.value)))} /></div></div>
          <div className="text-center font-semibold">Teams<div className="mt-2"><SelectDropdown isMulti isSearchable styles={multiStyles} options={teamOptions} placeholder="All Teams" onChange={(options) => setTeamIds(options.map((option) => Number(option.value)))} /></div></div>
        </div>
      )}
      {showLoading ? <div className="p-8 text-center">Loading weekly games…</div> : showError ? <div className="p-8 text-center text-red-500">{showError}</div> : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2">
                {["ID", "Week", "Game Title", "A.Coach", "A.Team", "A.R.", "A.Score", "H.Score", "H.R.", "H.Team", "H.Coach", "Arena", "City", "State"].map((column) => <th key={column} className="px-2 py-3 text-center">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredGames.length ? filteredGames.map((game) => {
                const isFinal = game.status === "Final" && game.homeScore !== undefined && game.awayScore !== undefined;
                return (
                  <tr key={game.id} className="border-b border-slate-600 odd:bg-slate-900/20 even:bg-slate-800/40">
                    <td className="px-2 py-3 text-center">{game.id}</td>
                    <td className="px-2 py-3 text-center font-semibold">{game.week}</td>
                    <td className="px-2 py-3 text-center">{game.gameName || "—"}</td>
                    <td className="px-2 py-3 text-center"><LaxCoachLink coach={game.awayTeam.coach} /></td>
                    <td className="px-2 py-3"><LaxTeamLink team={game.awayTeam} /></td>
                    <td className="px-2 py-3 text-center"></td>
                    <td className="px-2 py-3 text-center font-semibold">{score(game, isFinal, game.awayScore)}</td>
                    <td className="px-2 py-3 text-center font-semibold">{score(game, isFinal, game.homeScore)}</td>
                    <td className="px-2 py-3 text-center"></td>
                    <td className="px-2 py-3"><LaxTeamLink team={game.homeTeam} /></td>
                    <td className="px-2 py-3 text-center"><LaxCoachLink coach={game.homeTeam.coach} /></td>
                    <td className="px-2 py-3 text-center">{game.homeTeam.venue || "—"}</td>
                    <td className="px-2 py-3 text-center">{game.homeTeam.city || "—"}</td>
                    <td className="px-2 py-3 text-center">{game.homeTeam.state || "—"}</td>
                  </tr>
                );
              }) : <tr><td colSpan={14} className="p-8 text-center italic opacity-60">No games match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Border>
  );
};
