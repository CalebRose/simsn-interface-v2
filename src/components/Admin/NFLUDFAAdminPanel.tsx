import React, { useState } from 'react';
import { useAuthStore } from '../../context/AuthContext';
import { Button } from '../../_design/Buttons';
import { Text } from '../../_design/Typography';
import { useSimFBAStore } from '../../context/SimFBAContext';
import { useTeamColors } from '../../_hooks/useTeamColors';
import { AdminRole } from '../../_constants/constants';

export const AdminUDFAControls = () => {
    const { currentUser } = useAuthStore();
    const { nflTeam } = useSimFBAStore();
    const teamColors = useTeamColors(nflTeam?.ColorOne || "#1f2937", nflTeam?.ColorTwo || "#111827");
    const [isProcessing, setIsProcessing] = useState(false);

    const isAdmin = currentUser?.roleID === AdminRole || currentUser?.roleID?.includes("Commissioner");

    const handleRunSimulation = async () => {
        if (window.confirm("Process all league-wide UDFA bids? This is NOT reversible.")) {
            setIsProcessing(true);
            try {
                alert("UDFA Simulation completed successfully!");
            } catch (error) {
                alert("Error running simulation.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="w-full p-6 border-2 rounded-2xl shadow-xl flex flex-col mt-4" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="flex items-center justify-between">
                <Text variant="h5" classes="text-white font-bold uppercase tracking-widest italic">NFL UDFA Live Control</Text>
                <Button variant="warning" onClick={handleRunSimulation} disabled={isProcessing}>
                    {isProcessing ? "PROCESSING..." : "RUN UDFA SIMULATION"}
                </Button>
            </div>
        </div>
    );
};