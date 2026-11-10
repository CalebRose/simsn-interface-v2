import React, { FC, useCallback, useMemo } from "react";
import { Button, ButtonGrid } from "../../_design/Buttons";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { NFLPlayer } from "../../models/footballModels";
import { tagData } from "../../_constants/tagData";
import { Modal } from "../../_design/Modal";
import { Text } from "../../_design/Typography";

// ─── NFL Franchise Tag Modal ─────────────────────────────────────────────
interface FranchiseTagModalBodyProps {
  player: NFLPlayer;
  isOpen: boolean;
  onClose: () => void;
}

export const FranchiseTagModal: FC<FranchiseTagModalBodyProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  const { nflTeam, tagNFLPlayer } = useSimFBAStore();

  const playerLabel = useMemo(() => {
    if (!player) return "";
    return `${player.Position} ${player.FirstName} ${player.LastName}`;
  }, [player]);

  const UsedTagThisSeason = useMemo(() => {
    if (!nflTeam) return false;
    return nflTeam.UsedTagThisSeason || false;
  }, [nflTeam]);

  const bonusAmount = useMemo(() => {
    if (!player) return 0;
    const cleanPos = player.Position?.trim().toUpperCase();
    return tagData[cleanPos]?.["Franchise"] || 0.5;
  }, [player]);

  const valid = useMemo(() => {
    if (!player) return false;
    if (UsedTagThisSeason) return false;
    return true;
  }, [player, UsedTagThisSeason]);

  const confirmChange = useCallback(() => {
    if (!valid) return;
    const dto = {
      PlayerID: player.ID,
      TagType: 1, // 1 == Franchise Tag
      Position: player.Position,
    };
    tagNFLPlayer(dto);
    onClose();
  }, [valid, player, tagNFLPlayer, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Franchise Tag ${playerLabel}?`}
      actions={
        <ButtonGrid>
          <Button size="sm" variant="secondaryOutline" onClick={onClose}>
            <Text variant="small">Close</Text>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={confirmChange}
            disabled={!valid}
          >
            <Text variant="small">Confirm Franchise Tag</Text>
          </Button>
        </ButtonGrid>
      }
    >
      <div className="flex flex-col gap-y-3 p-1">
        <Text variant="body-small">
          Once you franchise tag {playerLabel}, they will have a 1-year contract
          added to their existing deal. Tagging will not be an option for them
          next season and an extension must be negotiated before they enter free
          agency.
        </Text>

        {UsedTagThisSeason && (
          <div className="p-2 rounded bg-red-900/40 border border-red-700">
            <Text variant="small" classes="text-red-400 font-semibold">
              WARNING: You have already used your franchise tag this season.
            </Text>
          </div>
        )}

        <div className="flex flex-col gap-y-2 p-3 bg-gray-900/60 rounded-lg border border-gray-700">
          <Text variant="h6" classes="font-bold text-white">
            Franchise Tag Cost
          </Text>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Text variant="small" classes="text-gray-400">
                Base Salary
              </Text>
              <Text variant="body" classes="font-mono font-bold text-white">
                $0.50M
              </Text>
            </div>
            <div>
              <Text variant="small" classes="text-gray-400">
                Bonus
              </Text>
              <Text variant="body" classes="font-mono font-bold text-green-400">
                ${bonusAmount.toFixed(2)}M
              </Text>
            </div>
            <div>
              <Text variant="small" classes="text-gray-400">
                Total Cap Hit
              </Text>
              <Text variant="body" classes="font-mono font-bold text-cyan-400">
                ${(0.5 + bonusAmount).toFixed(2)}M
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};