import { FC, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { SportSelect } from "../Common/SportKit";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeague,
  VbLeagueKind,
  VolleyballService,
} from "../../_services/volleyballService";
import {
  useVbResource,
  useVbSeasons,
  useVbStandingsById,
  useVbTeams,
  useVbTop25,
} from "./useVbData";
import { VbClaimButton } from "./VbClaimButton";
import { VbBannerSeason, VbEmpty, VbLoad } from "./VbCommon";
import {
  vbPaths,
  vbRecord,
  vbTeamFullName,
  vbTeamLogo,
} from "./vbFormatting";
import { VbPageShell } from "./VbPageShell";
import {
  SportBannerAside,
  SportBannerSections,
  useSportBannerContent,
  useSportBannerFacts,
  useSportSectionTab,
} from "../Common/SportBanner";
import { sportTeamColors } from "../Common/sportTheme";
import { VbRosterTab } from "./VbRoster";
import {
  VbCommitmentsTab,
  VbInjuriesTab,
  VbStaffTab,
  VbTeamHistoryTab,
  VbTeamScheduleTab,
} from "./VolleyballTeamTabs";

type TeamTab =
  | "roster"
  | "schedule"
  | "staff"
  | "history"
  | "injuries"
  | "commitments";

const TeamPageBody: FC<{ kind: VbLeagueKind; league: VbLeague }> = ({
  kind,
  league,
}) => {
  const { teamId } = useParams<{ teamId?: string }>();
  const navigate = useNavigate();
  const { cvbTeam, pvbTeam, vbLoading } = useSimVBStore();
  const ownTeam = kind === "college" ? cvbTeam : pvbTeam;
  const requestedId = Number(teamId);
  const selectedId =
    Number.isInteger(requestedId) && requestedId > 0
      ? requestedId
      : ownTeam?.TeamID;
  const teams = useVbTeams(kind);
  const team = useVbResource(selectedId ? `team:${selectedId}` : null, () =>
    VolleyballService.getTeam(selectedId!),
  );
  const { seasons, currentSeason } = useVbSeasons(kind);
  // The same list the History tab shows: its newest season is the record in
  // the header.
  const history = useVbResource(
    selectedId ? `team-history:${selectedId}` : null,
    () => VolleyballService.getTeamHistory(selectedId!),
  );
  const [season, setSeason] = useState<number | null>(null);
  const tabs: Array<readonly [TeamTab, string]> = [
    ["roster", "Roster"],
    ["schedule", "Schedule"],
    ["staff", "Staff"],
    ["history", "History"],
    ["injuries", "Injuries"],
    ...(kind === "college" ? [["commitments", "Commits"] as const] : []),
  ];
  // In the address; another team's page opens on its roster.
  const [tab, setTab] = useSportSectionTab(tabs, "roster");
  const shownSeason = season ?? currentSeason;
  // This season at a glance, as chips on the banner.
  const standings = useVbStandingsById(league, currentSeason);
  const top25 = useVbTop25(kind === "college" ? league : null, currentSeason);
  const standing = selectedId ? standings.get(selectedId) : undefined;
  const rank = selectedId ? top25.get(selectedId) : undefined;
  useSportBannerFacts([
    rank ? `No. ${rank}` : null,
    kind === "college" &&
      standing?.ConferenceID != null &&
      `${vbRecord({ Wins: standing.ConfWins, Losses: standing.ConfLosses })} conf`,
    standing?.Streak,
    team.data &&
      (team.data.Controller === "human" ? "Coached by a user" : "AI coached"),
    ownTeam?.TeamID === selectedId && "Your team",
  ]);
  // The team on screen is the banner's: name, colours, logo, and its record.
  const lastSeason = [...(history.data?.Seasons ?? [])].sort(
    (a, b) => b.Season - a.Season,
  )[0];
  const shown = team.data;
  useSportBannerContent(
    shown
      ? {
          title: vbTeamFullName(shown),
          subtitle: [
            shown.Conference,
            shown.City,
            lastSeason
              ? `${lastSeason.Season}: ${lastSeason.Wins}–${lastSeason.Losses}${lastSeason.InProgress ? " so far" : ""}`
              : null,
          ]
            .filter(Boolean)
            .join(" · "),
          logo: vbTeamLogo(shown, kind, league),
          ...sportTeamColors(shown.ColorOne, shown.ColorTwo),
        }
      : null,
  );

  const teamOptions = useMemo(
    () =>
      [...(teams ?? [])]
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map((item) => ({ value: String(item.TeamID), label: item.Name })),
    [teams],
  );
  const picker = (
    <div className="w-full text-(--text-primary) sm:w-72">
      <SportSelect
        options={teamOptions}
        value={
          teamOptions.find((option) => option.value === String(selectedId)) ??
          null
        }
        placeholder="Select a team..."
        onChange={(option) =>
          option && navigate(vbPaths(kind).team(Number(option.value)))
        }
      />
    </div>
  );

  if (!selectedId) {
    // No team in the address and none of their own: wait for sign-in data,
    // then let the user pick one.
    if (vbLoading) return <VbLoad loading error={null}>{null}</VbLoad>;
    return (
      <>
        {picker}
        <VbEmpty>
          You do not coach a team in this league. Pick a team to view.
        </VbEmpty>
      </>
    );
  }

  // A link can carry a team of the other league; send it to the right pages.
  const teamKind: VbLeagueKind | null = team.data
    ? team.data.Kind === "pro_club"
      ? "pro"
      : "college"
    : null;
  if (teamKind && teamKind !== kind) {
    return <Navigate to={vbPaths(teamKind).team(selectedId)} replace />;
  }

  return (
    <VbLoad loading={team.loading} error={team.error}>
      {team.data && (
        <div className="space-y-3">
          {/* On the banner: the request button and any team; who coaches it
              is among the banner's chips. */}
          <SportBannerAside>
            <VbClaimButton kind={kind} team={team.data} />
            {picker}
          </SportBannerAside>
          {tab === "schedule" && shownSeason !== null && (
            <VbBannerSeason
              seasons={seasons}
              season={shownSeason}
              onChange={setSeason}
            />
          )}
          <SportBannerSections tabs={tabs} value={tab} onChange={setTab} />
          {tab === "roster" && <VbRosterTab kind={kind} team={team.data} />}
          {tab === "schedule" && shownSeason !== null && (
            <VbTeamScheduleTab
              kind={kind}
              team={team.data}
              season={shownSeason}
            />
          )}
          {tab === "staff" && <VbStaffTab kind={kind} team={team.data} />}
          {tab === "history" && (
            <VbTeamHistoryTab kind={kind} team={team.data} />
          )}
          {tab === "injuries" && <VbInjuriesTab kind={kind} team={team.data} />}
          {tab === "commitments" && (
            <VbCommitmentsTab kind={kind} team={team.data} />
          )}
        </div>
      )}
    </VbLoad>
  );
};

export const VolleyballTeamPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Team">
    {(league) => <TeamPageBody kind={kind} league={league} />}
  </VbPageShell>
);
