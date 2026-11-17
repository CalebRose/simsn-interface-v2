import { FC, ReactNode } from "react";
import { PageContainer } from "../../_design/Container";
import { useSimVBStore } from "../../context/SimVBContext";
import { VbLeague, VbLeagueKind } from "../../_services/volleyballService";
import {
  SportBanner,
  SportBannerHostProvider,
  SportNavRow,
  useSportBannerHost,
} from "../Common/SportBanner";
import { useVbClock } from "./useVbClock";
import { useVbStandingsById, useVbTop25 } from "./useVbData";
import { VbEmpty } from "./VbCommon";
import { VbPlayerCardProvider } from "./VbPlayerCard";
import {
  vbClockLabel,
  vbLeagueConstant,
  vbLeagueLogo,
  vbRecord,
  vbRoleLabel,
  vbTeamFullName,
  vbTeamLogo,
} from "./vbFormatting";
import { vbCalendarFacts, vbNavGroups } from "./vbNav";
import { sportTeamColors } from "../Common/sportTheme";

// The banner's colours for someone who does not coach in the league.
const LEAGUE_COLOR = "#1F2937";
const LEAGUE_ACCENT = "#F59E0B";

interface VbPageShellProps {
  kind: VbLeagueKind;
  title: string;
  /** The league home also states the shape of the year. */
  home?: boolean;
  /** Rendered once the league is known. */
  children: (league: VbLeague) => ReactNode;
}

/**
 * The league's banner and its page, for a page that already has its own
 * container (the site's Home page shows the league home in one). The banner
 * is the same on every volleyball page: for a coach in the league it is their
 * team's, with their own pages first; for anyone else it is the league's.
 * It also owns the two "volleyball is not there" states, so pages only render
 * with a league.
 */
export const VbLeagueFrame: FC<VbPageShellProps> = ({
  kind,
  title,
  home = false,
  children,
}) => {
  const { vbAvailable, vbLeagues, cvbTeam, pvbTeam, vbCoaches } =
    useSimVBStore();
  const league = vbLeagues[kind];
  const clock = useVbClock(kind);
  const ownTeam = kind === "college" ? cvbTeam : pvbTeam;
  const leagueName = vbLeagueConstant(kind);
  // A page about one team (Team, Staff, Finances) puts that team here.
  const { host, content, facts, slotRef, rowsRef, sectionsRef } =
    useSportBannerHost();
  // The coach's own team at a glance, on every page that shows it.
  const standings = useVbStandingsById(league, clock?.Season ?? null);
  const top25 = useVbTop25(
    kind === "college" ? league : null,
    clock?.Season ?? null,
  );
  const standing = ownTeam ? standings.get(ownTeam.TeamID) : undefined;
  // An assistant on a pro club sees their job; a head coach needs no chip.
  const ownRole = vbCoaches[kind]?.Role;
  const roleFact =
    ownTeam && ownRole && ownRole !== "headCoach" ? vbRoleLabel(ownRole) : "";
  const rank = ownTeam ? top25.get(ownTeam.TeamID) : undefined;
  const teamFacts =
    ownTeam && !content?.title && standing
      ? [
          roleFact,
          rank ? `No. ${rank}` : "",
          vbRecord(standing),
          kind === "college" && standing.ConferenceID != null
            ? `${vbRecord({ Wins: standing.ConfWins, Losses: standing.ConfLosses })} conf`
            : "",
          standing.Streak,
        ].filter(Boolean)
      : [];
  const own = ownTeam
    ? sportTeamColors(ownTeam.ColorOne, ownTeam.ColorTwo)
    : { color: LEAGUE_COLOR, accent: LEAGUE_ACCENT };
  const color = content?.color ?? own.color;
  const accent = content?.accent ?? own.accent;
  const nextAdvance = clock?.NextAction
    ? `Next advance: ${clock.NextAction}${
        clock.NextDueAt ? ` · ${new Date(clock.NextDueAt).toLocaleString()}` : ""
      }`
    : "";
  const detail = [home ? vbCalendarFacts(clock) : "", nextAdvance]
    .filter(Boolean)
    .join(" · ");

  return (
    <VbPlayerCardProvider>
      <SportBanner
        league={leagueName}
        color={color}
        accent={accent}
        slotRef={slotRef}
        rowsRef={rowsRef}
        sectionsRef={sectionsRef}
        facts={[...teamFacts, ...(facts ?? [])]}
        logo={
          content?.logo ??
          (ownTeam ? vbTeamLogo(ownTeam, kind, league) : vbLeagueLogo(kind, league))
        }
        title={
          content?.title ??
          (ownTeam ? vbTeamFullName(ownTeam) : `${leagueName} · ${title}`)
        }
        subtitle={
          content?.subtitle ??
          [
            ownTeam ? `${leagueName} · ${title}` : "",
            ownTeam?.Conference ?? "",
            clock ? vbClockLabel(clock) : "",
          ]
            .filter(Boolean)
            .join(" · ")
        }
        detail={content?.detail ?? (detail || undefined)}
      >
        <SportNavRow
          color={color}
          accent={accent}
          groups={vbNavGroups(kind, ownTeam, clock)}
        />
      </SportBanner>
      {league ? (
        <SportBannerHostProvider value={host}>
          {children(league)}
        </SportBannerHostProvider>
      ) : (
        <VbEmpty tone={vbAvailable ? "error" : "muted"}>
          {vbAvailable
            ? "The volleyball service could not be reached. Try again in a moment."
            : "SimSN Volleyball is not available in this build."}
        </VbEmpty>
      )}
    </VbPlayerCardProvider>
  );
};

/** Every volleyball page: the league's banner, then the page. */
export const VbPageShell: FC<VbPageShellProps> = (props) => {
  const { vbAvailable, vbLeaguesChecked } = useSimVBStore();
  return (
    <PageContainer direction="col" isLoading={vbAvailable && !vbLeaguesChecked}>
      <VbLeagueFrame {...props} />
    </PageContainer>
  );
};
