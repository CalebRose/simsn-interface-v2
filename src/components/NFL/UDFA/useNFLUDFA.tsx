import { useEffect, useState } from "react";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useSnackbar } from "notistack";

export const useNFLUDFA = () => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    nflTeam,
    nflUDFABoard,
    getUDFABoard,
    saveUDFABoard,
    removePlayerFromUDFABoard,
    processUDFAs, // Real store method for moving UDFAs
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

  const handleMoveUDFAsToFA = async () => {
    try {
      // 1. Wipe out/clear active bids locally or reset point allocations to 0
      if (localBoard && localBoard.Profiles) {
        const clearedProfiles = localBoard.Profiles.map((p: any) => ({
          ...p,
          Points: 0,
        }));
        
        // Save the wiped board first so the backend records zeroed-out bids
        await saveUDFABoard({ ...localBoard, Profiles: clearedProfiles });
      }

      // 2. Now trigger the move to Free Agency without active roster awards
      await processUDFAs();
      
      enqueueSnackbar("Bids wiped and UDFAs moved to Free Agency successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar("Failed to clear bids and move UDFAs.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    }
  };

  return {
    board: localBoard,
    pointsRemaining,
    handlePointChange,
    saveBids,
    removePlayer: removePlayerFromUDFABoard,
    handleMoveUDFAsToFA,
  };
};