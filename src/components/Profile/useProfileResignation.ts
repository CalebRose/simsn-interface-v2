import { doc, updateDoc } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useRef, useState } from "react";
import { League } from "../../_constants/constants";
import { createResignationReport } from "../../_services/adminReportService";
import { useAuthStore } from "../../context/AuthContext";
import { firestore } from "../../firebase/firebase";
import { CurrentUser } from "../../_hooks/useCurrentUser";

type ResignationFields = Partial<
  Pick<
    CurrentUser,
    "teamId" | "NFLTeamID" | "NFLRole" | "cbb_id" | "NBATeamID" |
    "NBARole" | "CHLTeamID" | "PHLTeamID" | "PHLRole"
  >
>;

interface ResignationInput {
  league: League;
  teamID: number | undefined;
  phase: number | null;
  weekID: number | null;
  remove: (teamID: number) => Promise<unknown>;
  clearFields?: ResignationFields;
  onComplete: () => void;
}

export const useProfileResignation = () => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const [isResigning, setIsResigning] = useState(false);
  const inFlight = useRef(false);

  const resign = async (input: ResignationInput) => {
    if (inFlight.current) return;
    if (!currentUser || !input.teamID || input.teamID <= 0) {
      enqueueSnackbar("Unable to resign: your team or user information is unavailable.", {
        variant: "error",
      });
      return;
    }

    inFlight.current = true;
    setIsResigning(true);
    try {
      try {
        await input.remove(input.teamID);
      } catch (error) {
        console.error("Team resignation failed", error);
        enqueueSnackbar("Unable to resign from your team. Please try again.", {
          variant: "error",
        });
        return;
      }

      try {
        await createResignationReport({
          league: input.league,
          teamID: input.teamID,
          userID: currentUser.id,
          username: currentUser.username,
          phase: input.phase,
          weekID: input.weekID,
        });
      } catch (error) {
        console.error("Resignation succeeded but the admin report failed", error);
        enqueueSnackbar(
          "You resigned, but the admin report could not be saved. Please notify an administrator.",
          { variant: "warning", persist: true },
        );
      }

      if (input.clearFields) {
        try {
          await updateDoc(doc(firestore, "users", currentUser.id), input.clearFields);
        } catch (error) {
          console.error("Resignation succeeded but the user profile could not be updated", error);
          enqueueSnackbar(
            "You resigned, but your profile could not be updated. Please contact an administrator.",
            { variant: "warning", persist: true },
          );
        }
        setCurrentUser((user) =>
          user?.id === currentUser.id ? { ...user, ...input.clearFields } : user,
        );
      }
      input.onComplete();
    } finally {
      inFlight.current = false;
      setIsResigning(false);
    }
  };

  return { resign, isResigning };
};
