import React, { useState, useRef, useEffect } from "react";
import { Text } from "../../../_design/Typography";
import { Button } from "../../../_design/Buttons";

interface ModerationControlsProps {
  canEdit: boolean;
  canDelete: boolean;
  canLock?: boolean;
  canPin?: boolean;
  canMove?: boolean;
  isLocked?: boolean;
  isPinned?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onMove?: () => void;
}

export const ModerationControls: React.FC<ModerationControlsProps> = ({
  canEdit,
  canDelete,
  canLock = false,
  canPin = false,
  canMove = false,
  isLocked = false,
  isPinned = false,
  onEdit,
  onDelete,
  onLock,
  onUnlock,
  onPin,
  onUnpin,
  onMove,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasActions = canEdit || canDelete || canLock || canPin || canMove;
  if (!hasActions) return null;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="secondaryOutline"
        size="xs"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        ···
      </Button>

      {open && (
        <div className="absolute p-1 right-0 top-full mt-1 w-36 bg-gray-700 border border-gray-600 rounded shadow-lg z-20 py-1">
          {canEdit && onEdit && (
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full text-left text-sm px-3 py-1.5 hover:bg-gray-700 transition-colors"
            >
              Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full text-left text-sm px-3 py-1.5 text-red-400 hover:bg-gray-700 transition-colors"
            >
              ❌ Delete
            </button>
          )}
          {canLock && (
            <>
              {!isLocked && onLock && (
                <button
                  onClick={() => {
                    onLock();
                    setOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-1.5 text-yellow-400 hover:bg-gray-700 transition-colors"
                >
                  🔒 Lock thread
                </button>
              )}
              {isLocked && onUnlock && (
                <button
                  onClick={() => {
                    onUnlock();
                    setOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-1.5 text-green-400 hover:bg-gray-700 transition-colors"
                >
                  🔓 Unlock thread
                </button>
              )}
            </>
          )}
          {canPin && (
            <>
              {!isPinned && onPin && (
                <button
                  onClick={() => {
                    onPin();
                    setOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-1.5 hover:bg-gray-700 transition-colors"
                >
                  📌 Pin thread
                </button>
              )}
              {isPinned && onUnpin && (
                <button
                  onClick={() => {
                    onUnpin();
                    setOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-1.5 hover:bg-gray-700 transition-colors"
                >
                  Unpin thread
                </button>
              )}
            </>
          )}
          {canMove && onMove && (
            <button
              onClick={() => {
                onMove();
                setOpen(false);
              }}
              className="w-full text-left text-sm px-3 py-1.5 text-blue-400 hover:bg-gray-700 transition-colors"
            >
              ↗ Move thread
            </button>
          )}
        </div>
      )}
    </div>
  );
};
