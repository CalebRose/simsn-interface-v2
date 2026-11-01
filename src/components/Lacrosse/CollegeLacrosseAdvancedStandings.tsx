import { CSSProperties, useMemo, useState } from "react";
import { StylesConfig } from "react-select";
import { Border } from "../../_design/Borders";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { LaxConferenceStandings } from "../../_services/lacrosseService";
import { LaxCoachLink, LaxTeamLink } from "./LaxTeamLink";

interface Props {
  conferenceStandings: LaxConferenceStandings[];
  userTeamId: number;
  primary: string;
  headerStyle: CSSProperties;
}

const selectStyles: StylesConfig<SelectOption, true> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "48px",
    width: "100%",
    maxWidth: "none",
    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
    borderRadius: "8px",
  }),
};

const columns = ["Team", "Conference", "Coach", "T.W", "T.L", "C.W", "C.L", "PF", "PA", "PD", "HW", "AW", "Strk.", "Ovr", "Off.", "Def.", "W%", "Conf. W%"];

export const CollegeLacrosseAdvancedStandings = ({ conferenceStandings, userTeamId, primary, headerStyle }: Props) => {
  const [conferenceIds, setConferenceIds] = useState<number[]>([]);
  const [teamIds, setTeamIds] = useState<number[]>([]);

  const conferenceOptions = useMemo(
    () => conferenceStandings.map(({ conference }) => ({ value: String(conference.id), label: conference.abbreviation || conference.name })),
    [conferenceStandings],
  );
  const teamOptions = useMemo(
    () => conferenceStandings.flatMap(({ standings }) => standings.map(({ team }) => ({ value: String(team.id), label: `${team.name} | ${team.abbreviation}` }))),
    [conferenceStandings],
  );

  const rows = useMemo(
    () => conferenceStandings.flatMap(({ conference, standings }) => standings.map((standing) => ({ standing, conferenceId: conference.id, conferenceName: conference.abbreviation || conference.name }))),
    [conferenceStandings],
  );

  const filteredRows = useMemo(() => {
    const conferenceSet = new Set(conferenceIds);
    const teamSet = new Set(teamIds);
    return rows.filter((row) => (conferenceSet.size === 0 || conferenceSet.has(row.conferenceId)) && (teamSet.size === 0 || teamSet.has(row.standing.team.id)));
  }, [rows, conferenceIds, teamIds]);

  return (
    <Border classes="overflow-hidden p-4 lg:col-span-2" styles={{ borderColor: primary }}>
      <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={headerStyle}>Advanced Standings View</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="text-center font-semibold">Conferences<div className="mt-2"><SelectDropdown isMulti isSearchable styles={selectStyles} options={conferenceOptions} placeholder="All Conferences" onChange={(options) => setConferenceIds(options.map((option) => Number(option.value)))} /></div></div>
        <div className="text-center font-semibold">Teams<div className="mt-2"><SelectDropdown isMulti isSearchable styles={selectStyles} options={teamOptions} placeholder="All Teams" onChange={(options) => setTeamIds(options.map((option) => Number(option.value)))} /></div></div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table data-keep-table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead><tr className="border-b-2">{columns.map((column) => <th key={column} className="px-2 py-3 text-center">{column}</th>)}</tr></thead>
          <tbody>
            {filteredRows.length ? filteredRows.map(({ standing, conferenceName }) => {
              const played = standing.totalWins + standing.totalLosses;
              const conferencePlayed = standing.conferenceWins + standing.conferenceLosses;
              return (
                <tr key={standing.team.id} className={`border-b border-slate-600 odd:bg-slate-900/20 even:bg-slate-800/40 ${standing.team.id === userTeamId ? "font-bold" : ""}`}>
                  <td className="px-2 py-3"><LaxTeamLink team={standing.team} /></td>
                  <td className="px-2 py-3 text-center">{conferenceName}</td>
                  <td className="px-2 py-3 text-center"><LaxCoachLink coach={standing.team.coach} /></td>
                  <td className="px-2 py-3 text-center">{standing.totalWins}</td>
                  <td className="px-2 py-3 text-center">{standing.totalLosses}</td>
                  <td className="px-2 py-3 text-center">{standing.conferenceWins}</td>
                  <td className="px-2 py-3 text-center">{standing.conferenceLosses}</td>
                  <td className="px-2 py-3 text-center">{standing.goalsFor}</td>
                  <td className="px-2 py-3 text-center">{standing.goalsAgainst}</td>
                  <td className="px-2 py-3 text-center">{standing.goalsFor - standing.goalsAgainst}</td>
                  <td className="px-2 py-3 text-center">{standing.homeWins}</td>
                  <td className="px-2 py-3 text-center">{standing.awayWins}</td>
                  <td className="px-2 py-3 text-center">{standing.streak || "—"}</td>
                  <td className="px-2 py-3 text-center">{standing.overallGrade || "—"}</td>
                  <td className="px-2 py-3 text-center">{standing.offenseGrade || "—"}</td>
                  <td className="px-2 py-3 text-center">{standing.defenseGrade || "—"}</td>
                  <td className="px-2 py-3 text-center">{played ? (standing.totalWins / played).toFixed(3) : "—"}</td>
                  <td className="px-2 py-3 text-center">{conferencePlayed ? (standing.conferenceWins / conferencePlayed).toFixed(3) : "—"}</td>
                </tr>
              );
            }) : <tr><td colSpan={columns.length} className="p-8 text-center italic opacity-60">No teams match the selected filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </Border>
  );
};
