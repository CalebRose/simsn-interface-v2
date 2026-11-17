import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Modal } from "../../_design/Modal";
import { Text } from "../../_design/Typography";
import { DraftService } from "../../_services/draftService";
import { NFLDraftee } from "../../models/footballModels";

interface ProDayNominationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamID: number;
  teamName: string;
}

export const ProDayNominationModal: React.FC<ProDayNominationModalProps> = ({
  isOpen,
  onClose,
  teamID,
  teamName,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState<NFLDraftee[]>([]);
  const [allowNominations, setAllowNominations] = useState(false);
  const [selectedIDs, setSelectedIDs] = useState<number[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && teamID > 0) {
      loadNominations();
    }
  }, [isOpen, teamID]);

  const loadNominations = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await DraftService.GetProDayNominationsByTeam(teamID);
      const playerList: NFLDraftee[] = res?.Players || [];
      setPlayers(playerList);
      setAllowNominations(Boolean(res?.AllowProDayNominations));

      // Pre-select currently nominated players
      const nominated = playerList
        .filter((p) => p.IsNominatedForProDay)
        .map((p) => p.ID);
      setSelectedIDs(nominated);
    } catch (e) {
      setMessage({
        type: "error",
        text: `Failed to load players: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlayer = (playerID: number) => {
    if (selectedIDs.includes(playerID)) {
      setSelectedIDs(selectedIDs.filter((id) => id !== playerID));
      return;
    }
    if (selectedIDs.length >= 5) {
      setMessage({
        type: "error",
        text: "You may only nominate a maximum of 5 players for Pro Days.",
      });
      return;
    }
    setMessage(null);
    setSelectedIDs([...selectedIDs, playerID]);
  };

  const handleSave = async () => {
    if (selectedIDs.length > 5) {
      setMessage({
        type: "error",
        text: "A maximum of 5 players may be nominated.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await DraftService.SubmitProDayNominations({
        TeamID: teamID,
        PlayerIDs: selectedIDs,
      });
      setMessage({
        type: "success",
        text: `Successfully nominated ${selectedIDs.length} player(s) for Pro Days!`,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      setMessage({
        type: "error",
        text: `Failed to submit nominations: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${teamName} - Pro Day Nominations`}
      actions={
        <ButtonGroup>
          <Button variant="secondaryOutline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={submitting || loading || !allowNominations}
          >
            {submitting ? "Saving..." : `Save Nominations (${selectedIDs.length}/5)`}
          </Button>
        </ButtonGroup>
      }
    >
      <div className="flex flex-col gap-4 p-2 text-start max-h-[60vh] overflow-y-auto">
        <div>
          <Text variant="body-small" classes="text-gray-300">
            Nominate up to 5 declared or graduated players from your program to
            participate in official Pro Day testing.
          </Text>
          {!allowNominations && (
            <div className="mt-2 p-2 bg-yellow-900/60 border border-yellow-600 rounded text-yellow-200 text-xs">
              Pro Day nominations are currently closed by the commissioner.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-b border-gray-700 pb-2">
          <Text variant="small" className="font-semibold text-gray-200">
            Eligible Prospects ({players.length})
          </Text>
          <Text
            variant="small"
            classes={`font-mono font-semibold ${
              selectedIDs.length === 5
                ? "text-yellow-400"
                : selectedIDs.length > 5
                  ? "text-red-400"
                  : "text-blue-400"
            }`}
          >
            Selected: {selectedIDs.length} / 5
          </Text>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            Loading eligible players...
          </div>
        ) : players.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            No declared or graduated players found for {teamName}.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const isSelected = selectedIDs.includes(p.ID);
              return (
                <div
                  key={p.ID}
                  onClick={() => allowNominations && handleTogglePlayer(p.ID)}
                  className={`flex items-center justify-between p-3 rounded border transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-950/60 border-blue-500 text-white"
                      : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600"
                  } ${!allowNominations ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!allowNominations}
                      onChange={() => handleTogglePlayer(p.ID)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {p.Position} {p.FirstName} {p.LastName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {p.Archetype} | Stars: {p.Stars} | Grade: {p.OverallGrade || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 rounded bg-gray-800 border border-gray-700">
                    ID #{p.ID}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {message && (
          <Text
            variant="body-small"
            classes={
              message.type === "success" ? "text-green-400" : "text-red-400"
            }
          >
            {message.text}
          </Text>
        )}
      </div>
    </Modal>
  );
};
