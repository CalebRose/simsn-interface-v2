import React, { useState } from "react";
import { useAuthStore } from "../../context/AuthContext";
import { Button } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { AdminRole } from "../../_constants/constants";
import { useSimFBAStore } from "../../context/SimFBAContext";

export const NFLUDFAAdminPanel = () => {
  const { currentUser } = useAuthStore();
  const { processUDFAs } = useSimFBAStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isForcing, setIsForcing] = useState(false);

  // Strict Admin verification
  const isAdmin =
    currentUser?.roleID === AdminRole ||
    currentUser?.roleID?.includes("Commissioner");

  const handleRunSimulation = async () => {
    if (
      window.confirm(
        "Process all league-wide UDFA bids? This is NOT reversible.",
      )
    ) {
      setIsProcessing(true);
      try {
        await processUDFAs();
        alert("UDFA Simulation completed successfully!");
      } catch (error) {
        alert("Error running simulation.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // NEW: Force unsigned players directly to Free Agency
  const handleForceToFA = async () => {
    if (
      window.confirm(
        "Force all unsigned UDFAs directly to general Free Agency without running bids?",
      )
    ) {
      setIsForcing(true);
      try {
        const response = await fetch("http://localhost:5001/api/admin/force-udfas-to-fa");
        if (!response.ok) throw new Error("Failed to force UDFAs to FA");
        
        alert("Unsigned UDFAs successfully moved to Free Agency!");
      } catch (error) {
        alert("Error moving players to Free Agency.");
      } finally {
        setIsForcing(false);
      }
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="w-full p-6 border-2 border-gray-600 rounded-2xl shadow-xl flex flex-col mt-4 bg-gray-800 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <Text
            variant="h5"
            classes="text-white font-bold uppercase tracking-widest italic"
          >
            NFL UDFA Live Control
          </Text>
          <Text variant="small" classes="text-gray-400">
            Process all submitted 1-20 bids and sign players.
          </Text>
        </div>
        <Button
          variant="warning"
          onClick={handleRunSimulation}
          disabled={isProcessing}
        >
          {isProcessing ? "PROCESSING..." : "RUN UDFA SIMULATION"}
        </Button>
      </div>

      <div className="flex items-center justify-between border-t border-gray-700 pt-4">
        <div>
          <Text
            variant="h5"
            classes="text-white font-bold uppercase tracking-widest italic"
          >
            Bypass & Move to FA
          </Text>
          <Text variant="small" classes="text-gray-400">
            Instantly move remaining unsigned UDFAs to general Free Agency.
          </Text>
        </div>
        <Button
          variant="danger"
          onClick={handleForceToFA}
          disabled={isForcing}
        >
          {isForcing ? "MOVING..." : "FORCE UN！）UNSIGNED TO FA"}
        </Button>
      </div>
    </div>
  );
};