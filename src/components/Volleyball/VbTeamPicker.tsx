import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SportSelect } from "../Common/SportKit";
import { useSimVBStore } from "../../context/SimVBContext";
import { VbLeagueKind, VolleyballService } from "../../_services/volleyballService";
import { useVbResource, useVbTeams } from "./useVbData";
import {
  SportBannerAside,
  useSportBannerContent,
} from "../Common/SportBanner";
import { sportTeamColors } from "../Common/sportTheme";
import { vbTeamFullName, vbTeamLogo } from "./vbFormatting";

/**
 * For a public page about one team: the team in the address, else the
 * viewer's own, with a dropdown to move to any other team in the league.
 * `pathFor` builds the page's address for a team id.
 */
export const useVbTeamPicker = (
  kind: VbLeagueKind,
  pathFor: (teamId: number) => string,
) => {
  const { teamId } = useParams<{ teamId?: string }>();
  const navigate = useNavigate();
  const { cvbTeam, pvbTeam, vbLoading, vbLeagues } = useSimVBStore();
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
  const options = useMemo(
    () =>
      [...(teams ?? [])]
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map((item) => ({ value: String(item.TeamID), label: item.Name })),
    [teams],
  );
  // The team on screen is the banner's: its name, colours and logo, with the
  // picker on the right. The page itself draws no team header.
  const shown = team.data;
  useSportBannerContent(
    shown
      ? {
          title: vbTeamFullName(shown),
          subtitle: [shown.Conference, shown.City].filter(Boolean).join(" · "),
          logo: vbTeamLogo(shown, kind, vbLeagues[kind]),
          ...sportTeamColors(shown.ColorOne, shown.ColorTwo),
        }
      : null,
  );
  const picker = (
    <SportBannerAside>
    <div className="w-full text-(--text-primary) sm:w-72">
      <SportSelect
        options={options}
        value={
          options.find((option) => option.value === String(selectedId)) ?? null
        }
        placeholder="Select a team..."
        onChange={(option) => option && navigate(pathFor(Number(option.value)))}
      />
    </div>
    </SportBannerAside>
  );
  return {
    team,
    picker,
    /** True when the team on screen is the viewer's own. */
    isOwn: Boolean(selectedId && ownTeam?.TeamID === selectedId),
    /** No team in the address and none of their own (once that is known). */
    nothingSelected: !selectedId && !vbLoading,
    waiting: !selectedId && vbLoading,
  };
};
