import React from "react";
import { GameReference } from "../../../models/forumModels";
import { ForumBorder } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { useNavigate } from "react-router-dom";

interface GameReferenceCardProps {
  gameRef: GameReference;
  onOpen?: () => void;
}

const LEAGUE_LABELS: Record<string, string> = {
  simcfb: "SimCFB",
  simnfl: "SimNFL",
  simcbb: "SimCBB",
  simnba: "SimNBA",
  simchl: "SimCHL",
  simphl: "SimPHL",
  simcbl: "SimCBL",
  simmlb: "SimMLB",
};

export const GameReferenceCard: React.FC<GameReferenceCardProps> = ({
  gameRef,
  onOpen,
}) => {
  const navigate = useNavigate();

  return (
    <ForumBorder classes="p-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs bg-orange-700 text-white px-1.5 py-0.5 rounded font-medium">
              {LEAGUE_LABELS[gameRef.league] ?? gameRef.league.toUpperCase()}
            </span>
            {gameRef.gameDateLabel && (
              <Text variant="xs" classes="text-gray-400">
                {gameRef.gameDateLabel}
              </Text>
            )}
            {gameRef.gameStatus && (
              <Text variant="xs" classes="text-gray-400">
                · {gameRef.gameStatus}
              </Text>
            )}
          </div>
          <Text variant="body-small" classes="font-semibold">
            {gameRef.gameLabel}
          </Text>
          {gameRef.seasonId && gameRef.weekId && (
            <Text variant="xs" classes="text-gray-500">
              Season {gameRef.seasonId} · Week {gameRef.weekId}
            </Text>
          )}
        </div>

        {gameRef.sourcePath && (
          <button
            onClick={() => (onOpen ? onOpen() : navigate(gameRef.sourcePath!))}
            className="text-xs text-blue-400 hover:text-blue-300 underline shrink-0"
          >
            View game →
          </button>
        )}
      </div>
    </ForumBorder>
  );
};
