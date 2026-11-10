import React, { useState } from "react";
import { useAuthStore } from "../../context/AuthContext";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Modal } from "../../_design/Modal";
import { Text } from "../../_design/Typography";
import { AdminRole } from "../../_constants/constants";
import { fbaUrl } from "../../_constants/urls";
import { useSimFBAStore } from "../../context/SimFBAContext";

export const NFLUDFAAdminPanel: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { processUDFAs, udfas } = useSimFBAStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isForcing, setIsForcing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"sim" | "force" | null>(
    null,
  );
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Strict Admin verification
  const isAdmin =
    currentUser?.roleID === AdminRole ||
    currentUser?.roleID?.includes("Commissioner");

  const handleRunSimulation = async () => {
    setConfirmAction(null);
    setIsProcessing(true);
    setStatusMsg(null);
    try {
      await processUDFAs();
      setStatusMsg({
        type: "success",
        text: "UDFA Simulation completed successfully! Players signed based on bids.",
      });
    } catch (error) {
      setStatusMsg({
        type: "error",
        text: `Error running UDFA simulation: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceToFA = async () => {
    setConfirmAction(null);
    setIsForcing(true);
    setStatusMsg(null);
    try {
      const response = await fetch(`${fbaUrl}admin/force-udfas-to-fa`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to force UDFAs to Free Agency");

      setStatusMsg({
        type: "success",
        text: "Unsigned UDFAs successfully moved to general Free Agency!",
      });
    } catch (error) {
      setStatusMsg({
        type: "error",
        text: `Error moving players to Free Agency: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsForcing(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col w-full gap-y-6">
      <Border classes="w-full p-6 flex flex-col gap-y-4 bg-gray-800/40">
        <div className="flex flex-col gap-y-1 border-b border-gray-700 pb-3">
          <div className="flex justify-between items-center">
            <Text variant="h6" classes="font-bold text-white">
              NFL Undrafted Free Agent (UDFA) Controls
            </Text>
            {udfas && udfas.length > 0 && (
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700">
                {udfas.length} Available UDFAs
              </span>
            )}
          </div>
          <Text variant="small" classes="text-gray-400">
            Manage league-wide UDFA bidding rounds and transition undrafted players to free agency.
          </Text>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded border text-sm ${
              statusMsg.type === "success"
                ? "bg-green-950/60 border-green-700 text-green-300"
                : "bg-red-950/60 border-red-700 text-red-300"
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Run UDFA Simulation */}
          <div className="p-4 rounded border border-gray-700 bg-gray-900/60 flex flex-col justify-between gap-y-4">
            <div className="flex flex-col gap-y-1">
              <Text variant="body" classes="font-semibold text-white">
                Process UDFA Bids
              </Text>
              <Text variant="small" classes="text-gray-400">
                Evaluate all submitted 1-20 team priority bids, resolve ties, and automatically sign winning players to contracts.
              </Text>
            </div>
            <div>
              <Button
                variant="warning"
                onClick={() => setConfirmAction("sim")}
                disabled={isProcessing || isForcing}
              >
                {isProcessing ? "Processing Bids..." : "Run UDFA Simulation"}
              </Button>
            </div>
          </div>

          {/* Card 2: Force to Free Agency */}
          <div className="p-4 rounded border border-gray-700 bg-gray-900/60 flex flex-col justify-between gap-y-4">
            <div className="flex flex-col gap-y-1">
              <Text variant="body" classes="font-semibold text-white">
                Bypass & Move to Free Agency
              </Text>
              <Text variant="small" classes="text-gray-400">
                Instantly move any remaining unsigned UDFAs into the general NFL Free Agency pool without running bids.
              </Text>
            </div>
            <div>
              <Button
                variant="danger"
                onClick={() => setConfirmAction("force")}
                disabled={isProcessing || isForcing}
              >
                {isForcing ? "Moving Players..." : "Move Remaining to Free Agency"}
              </Button>
            </div>
          </div>
        </div>
      </Border>

      {/* Confirmation Modal */}
      {confirmAction && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction === "sim"
              ? "Confirm Run UDFA Simulation"
              : "Confirm Move UDFAs to Free Agency"
          }
          actions={
            <ButtonGroup classes="justify-end gap-x-2">
              <Button
                variant="secondaryOutline"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>
              <Button
                variant={confirmAction === "sim" ? "warning" : "danger"}
                onClick={
                  confirmAction === "sim"
                    ? handleRunSimulation
                    : handleForceToFA
                }
              >
                Confirm & Proceed
              </Button>
            </ButtonGroup>
          }
        >
          <div className="py-2 text-gray-300">
            {confirmAction === "sim" ? (
              <p>
                Are you sure you want to process all submitted UDFA bids league-wide?
                This action is <strong>not reversible</strong> and will generate player signings.
              </p>
            ) : (
              <p>
                Are you sure you want to move all remaining unsigned UDFAs directly to the general
                Free Agency pool without running bids?
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
