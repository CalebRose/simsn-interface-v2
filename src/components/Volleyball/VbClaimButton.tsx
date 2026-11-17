import { FC, useState } from "react";
import { useVbLevelRequests } from "./useVbData";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import routes from "../../_constants/routes";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeagueKind,
  VbTeam,
  VolleyballClaimService,
} from "../../_services/volleyballService";
import { vbErrorText } from "./vbErrors";
import { vbLeagueConstant } from "./vbFormatting";

/** Opens the shared Available Teams page on a volleyball league. */
export const useVbRequestTeam = () => {
  const navigate = useNavigate();
  const { setSelectedLeague } = useLeagueStore();
  return (kind: VbLeagueKind) => {
    setSelectedLeague(vbLeagueConstant(kind));
    navigate(routes.AVAILABLE_TEAMS);
  };
};

/**
 * On a team page with no human coach: the way to ask for it. Every sport's
 * requests are made on the Available Teams page, so this sends the user
 * there with the league already chosen. A request already waiting for this
 * team can be withdrawn here.
 */
export const VbClaimButton: FC<{ kind: VbLeagueKind; team: VbTeam }> = ({
  kind,
  team,
}) => {
  const { currentUser } = useAuthStore();
  const requestTeam = useVbRequestTeam();
  const { cvbTeam, pvbTeam, vbLoading, refreshVbMe } = useSimVBStore();
  const [withdrawing, setWithdrawing] = useState(false);
  const ownTeam = kind === "college" ? cvbTeam : pvbTeam;
  // Requests are separate per level.
  const { pending } = useVbLevelRequests(kind);

  if (vbLoading || !currentUser || team.Controller === "human") return null;
  if (ownTeam?.TeamID === team.TeamID) return null;

  if (pending) {
    const mine = pending.OrgID === team.TeamID;
    const withdraw = async () => {
      setWithdrawing(true);
      try {
        await VolleyballClaimService.withdraw(kind, pending.ID);
        await refreshVbMe();
        enqueueSnackbar("Request withdrawn.", { variant: "success" });
      } catch (reason) {
        enqueueSnackbar(vbErrorText(reason), { variant: "error" });
      } finally {
        setWithdrawing(false);
      }
    };
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs opacity-80">
        {mine
          ? "Your request for this team is waiting for approval."
          : `Your request for ${pending.TeamName} is waiting for approval.`}
        {/* Withdrawing is per league, so it is offered on the team's own page. */}
        {mine && (
          <SportButton
            size="xs"
            variant="secondary"
            onClick={withdraw}
            disabled={withdrawing}
          >
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </SportButton>
        )}
      </div>
    );
  }

  return (
    <SportButton
      size="sm"
      variant="success"
      title="Opens the Available Teams page, where every request is made"
      onClick={() => requestTeam(kind)}
    >
      Request a team
    </SportButton>
  );
};
