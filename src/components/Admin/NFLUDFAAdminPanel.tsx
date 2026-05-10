import React, { useState } from 'react';
import { useAuthStore } from '../../context/AuthContext'; // FIXED: Up two levels to reach src/context
import { Button } from '../../_design/Buttons';
import { Text } from '../../_design/Typography';
import { useSimFBAStore } from '../../context/SimFBAContext';
import { useTeamColors } from '../../_hooks/useTeamColors';

export const AdminUDFAControls = () => {
    // 1. Correct Auth Context usage
    const { currentUser } = useAuthStore(); 
    const { nflTeam } = useSimFBAStore();
    
    // Fallback colors if the admin doesn't have an NFL team assigned
    const teamColors = useTeamColors(
        nflTeam?.ColorOne || "#1f2937", 
        nflTeam?.ColorTwo || "#111827"
    );
    
    const [isProcessing, setIsProcessing] = useState(false);

    // Gate: Check Role from currentUser
    // Casting to any to ensure 'Role' is accessible if not in the base interface
    const isAdmin = (currentUser as any)?.Role === 'Admin' || (currentUser as any)?.role === 'Admin';

    const handleRunSimulation = async () => {
        const confirmRun = window.confirm(
            "CRITICAL WARNING: This will process all league-wide UDFA bids and sign players to teams. This action IS NOT reversible. Proceed?"
        );

        if (confirmRun) {
            setIsProcessing(true);
            try {
                console.log("Admin triggering UDFA Simulation...");
                // REPLACE THIS with your actual API call logic:
                // await NFLService.runUDFASimulation(); 
                
                alert("UDFA Simulation completed successfully!");
            } catch (error) {
                console.error("Simulation failed:", error);
                alert("Error running simulation. Check console.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // If not an admin, don't even render the box
    if (!isAdmin) return null;

    return (
        <div 
            className="w-full p-6 border-2 rounded-2xl shadow-xl flex flex-col gap-y-4" 
            style={{ 
                borderColor: teamColors.One, 
                backgroundColor: 'rgba(0,0,0,0.4)' 
            }}
        >
            <div className="flex flex-row items-center justify-between gap-x-4">
                <div className="flex flex-col">
                    <Text variant="h5" classes="text-white font-bold uppercase tracking-widest italic">
                        NFL UDFA Live Control
                    </Text>
                    <Text variant="small" classes="text-gray-400">
                        Process all undrafted free agent bids and conclude the UDFA stage for the entire league.
                    </Text>
                </div>

                <Button 
                    variant="warning" 
                    onClick={handleRunSimulation}
                    disabled={isProcessing}
                    classes="whitespace-nowrap"
                >
                    {isProcessing ? "PROCESSING..." : "RUN UDFA SIMULATION"}
                </Button>
            </div>

            {isProcessing && (
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mt-2">
                    <div className="bg-yellow-500 h-full animate-pulse w-full"></div>
                </div>
            )}
        </div>
    );
};