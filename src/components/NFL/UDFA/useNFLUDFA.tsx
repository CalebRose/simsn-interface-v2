import { useEffect, useState } from "react";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useSnackbar } from "notistack";

export const useNFLUDFA = () => {
  // We added getUDFABoard here
  const { enqueueSnackbar } = useSnackbar();

  const {
    nflTeam,
    nflUDFABoard,
    getUDFABoard,
    saveUDFABoard,
    removePlayerFromUDFABoard,
  } = useSimFBAStore();
  const [localBoard, setLocalBoard] = useState<any>(null);
  const [pointsRemaining, setPointsRemaining] = useState(20);

  // Self-Healing Logic: If the page loads and the board is missing, fetch it automatically.
  useEffect(() => {
    if (nflTeam && !nflUDFABoard) {
      getUDFABoard(nflTeam.ID);
    }
  }, [nflTeam, nflUDFABoard, getUDFABoard]);

  // Keep the local state in sync with the global board
  useEffect(() => {
    if (nflUDFABoard) {
      setLocalBoard(nflUDFABoard);
      const used =
        nflUDFABoard.Profiles?.reduce(
          (sum: number, p: any) => sum + p.Points,
          0,
        ) || 0;
      setPointsRemaining(20 - used);
    }
  }, [nflUDFABoard]);

  const handlePointChange = (profileID: number, val: number) => {
    if (isNaN(val)) val = 0;

    const updatedProfiles = localBoard.Profiles.map((p: any) => {
      if (p.ID === profileID) return { ...p, Points: val };
      return p;
    });

    const total = updatedProfiles.reduce(
      (sum: number, p: any) => sum + p.Points,
      0,
    );
    if (total > 20) {
      enqueueSnackbar("Total points cannot exceed 20", {
        variant: "error",
        autoHideDuration: 1000,
      });
    }

    setLocalBoard({ ...localBoard, Profiles: updatedProfiles });
    setPointsRemaining(20 - total);
  };

  const saveBids = async () => {
    await saveUDFABoard(localBoard);
  };

  return {
    board: localBoard,
    pointsRemaining,
    handlePointChange,
    saveBids,
    removePlayer: removePlayerFromUDFABoard,
  };
};
