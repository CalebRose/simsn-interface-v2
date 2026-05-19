import React, { useState } from 'react';
import { useAuthStore } from '../../context/AuthContext';
import { Button } from '../../_design/Buttons';
import { Text } from '../../_design/Typography';
import { AdminRole } from '../../_constants/constants';
// You will likely need an API service imported here later to actually hit your backend

export const NFLUDFAAdminPanel = () => {
    const { currentUser } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);

    // Strict Admin verification
    const isAdmin = currentUser?.roleID === AdminRole || currentUser?.roleID?.includes("Commissioner");

    const handleRunSimulation = async () => {
        if (window.confirm("Process all league-wide UDFA bids? This is NOT reversible.")) {
            setIsProcessing(true);
            try {
                // TODO: Wire this up to the actual backend API endpoint later
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
        <div className="w-full p-6 border-2 border-gray-600 rounded-2xl shadow-xl flex flex-col mt-4 bg-gray-800">
            <div className="flex items-center justify-between">
                <div>
                    <Text variant="h5" classes="text-white font-bold uppercase tracking-widest italic">NFL UDFA Live Control</Text>
                    <Text variant="small" classes="text-gray-400">Process all submitted 1-20 bids and sign players.</Text>
                </div>
                <Button variant="warning" onClick={handleRunSimulation} disabled={isProcessing}>
                    {isProcessing ? "PROCESSING..." : "RUN UDFA SIMULATION"}
                </Button>
            </div>
        </div>
    );
};