import React, { FC, useCallback, useMemo, useState } from "react";
import { Button, ButtonGrid } from "../../_design/Buttons";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { NFLPlayer } from "../../models/footballModels";
import { tagData } from "../../_constants/tagData";
import { Modal } from "../../_design/Modal";
import { Text } from "../../_design/Typography";
import { getTagTypeEnum } from "../../_helper/utilHelper";

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
  const { nflPlayerSeasonStatsMap, nflTeam, cfb_Timestamp, tagNFLPlayer } =
    useSimFBAStore();
  const [tagType, setTagType] = useState<string>("Basic");
  const snapLimit = 65;

  const seasonStats = useMemo(() => {
    if (!player || !cfb_Timestamp) return null;
    const seasonID = cfb_Timestamp?.NFLSeasonID;
    const seasonStatData = nflPlayerSeasonStatsMap[seasonID]?.find(
      (stat) => stat.PlayerID === player.ID,
    );
    return seasonStatData || null;
  }, [player, nflPlayerSeasonStatsMap, cfb_Timestamp]);

  const playerLabel = useMemo(() => {
    if (!player) return "";
    return `${player.Position} ${player.FirstName} ${player.LastName}`;
  }, [player]);

  const metSnapLimit = useMemo(() => {
    if (!seasonStats) return false;
    if (seasonStats.Snaps / seasonStats.GamesPlayed >= snapLimit) return true;
    return false;
  }, [seasonStats, snapLimit]);

  const UsedTagThisSeason = useMemo(() => {
    if (!nflTeam) return false;
    return nflTeam.UsedTagThisSeason || false;
  }, [nflTeam]);

  const bonusAmount = useMemo(() => {
    if (!player) return 0;
    let tag = tagType;
    if (tagType === "Basic" && metSnapLimit) {
      tag = "Playtime";
    }
    const ba = tagData[player.Position]?.[tag] || 0.5;
    return ba;
  }, [player, tagType, metSnapLimit]);

  const valid = useMemo(() => {
    if (!player) return false;
    if (UsedTagThisSeason) return false;
    let tag = tagType;
    if (tagType === "Basic" && metSnapLimit) {
      tag = "Playtime";
    }
    if (tag === "Basic" || (tag === "Playtime" && player.Experience < 5)) {
      return true;
    }
    return false;
  }, [player, UsedTagThisSeason, metSnapLimit]);

  const confirmChange = useCallback(() => {
    if (!valid) return;
    let tag = getTagTypeEnum(tagType);
    const dto = {
      PlayerID: player.ID,
      TagType: tag,
      Position: player.Position,
    };
    tagNFLPlayer(dto);
    onClose();
  }, [valid, player, tagType, tagNFLPlayer]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Franchise Tag ${playerLabel}?`}
        actions={
          <>
            <ButtonGrid>
              <Button size="sm" variant="primary" onClick={onClose}>
                <Text variant="small">Close</Text>
              </Button>

              <Button size="sm" variant="primary" onClick={confirmChange}>
                <Text variant="small">Confirm</Text>
              </Button>
            </ButtonGrid>
          </>
        }
      >
        <div className="flex flex-row gap-2 mb-2">
          WARNING: Once you've tagged {playerLabel}, they will have another year
          added to their existing contract. Tagging will not be an option for
          them next season and an extension must be negotiated. If no extension
          is negotiated, they will enter free agency because you couldn't pay
          them the money they deserve. So they will look for opportunities
          elsewhere so they can support their loved ones and the mortgage they
          have on their home.
        </div>
        <div className="flex flex-row gap-2 mb-2">
          Do you really want to tag {playerLabel} and put them through all that
          trouble for just another season? Think of your capsheet...
        </div>

        {!valid && (
          <div className="flex flex-row gap-2 mb-2">
            <p className="text-danger">
              WARNING! The tag selected is not valid to the player. Please
              select a different one. Clicking confirm will NOT submit the tag.
            </p>
          </div>
        )}

        <div className="flex flex-row gap-2 mb-2">
          <h6>Estimated Value of {tagType} Tag</h6>
          <div className="flex flex-col">
            <p>
              <strong>Salary:</strong> $0.5M
            </p>
          </div>
          <div className="flex flex-col">
            <p>
              <strong>Bonus:</strong> ${bonusAmount}M
            </p>
          </div>
        </div>
        <div className="flex flex-row mb-2">
          <ButtonGrid>
            <Button
              classes={`${tagType === "Basic" ? "btn-primary" : "btn-secondary"}`}
              disabled={tagType === "Basic"}
            >
              Basic
            </Button>
            <Button
              classes={`${
                tagType === "Playtime" ? "btn-primary" : "btn-secondary"
              }`}
              disabled
            >
              Playtime
            </Button>
            <Button
              classes={`${
                tagType === "Transition" ? "btn-primary" : "btn-secondary"
              }`}
              disabled
            >
              Transition
            </Button>
            <Button
              classes={`${
                tagType === "Franchise" ? "btn-primary" : "btn-secondary"
              }`}
              disabled={tagType === "Franchise" || UsedTagThisSeason}
            >
              Franchise
            </Button>
          </ButtonGrid>
        </div>
      </Modal>
    </>
  );
};
