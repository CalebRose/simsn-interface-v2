import { useEffect, useState } from "react";
import { useSimFBAStore } from "../../../context/SimFBAContext";

export const useNFLUDFA = () => {
    const { nflTeam, nflUDFABoard, saveUDFABoard, removePlayerFromUDFABoard } = useSimFBAStore();
    const [localBoard, setLocalBoard] = useState<any>(null);
    const [pointsRemaining, setPointsRemaining] = useState(20);

    useEffect(() => {
        if (nflUDFABoard) {
            setLocalBoard(nflUDFABoard);
            const used = nflUDFABoard.Profiles?.reduce((sum, p) => sum + p.Points, 0) || 0;
            setPointsRemaining(20 - used);
        }
    }, [nflUDFABoard]);

    const handlePointChange = (profileID: number, val: number) => {
        if (isNaN(val)) val = 0;
        
        const updatedProfiles = localBoard.Profiles.map((p: any) => {
            if (p.ID === profileID) return { ...p, Points: val };
            return p;
        });
        
        const total = updatedProfiles.reduce((sum: number, p: any) => sum + p.Points, 0);
        if (total > 20) {
            alert("You cannot spend more than 20 points!");
            return;
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
        removePlayer: removePlayerFromUDFABoard 
    };
};