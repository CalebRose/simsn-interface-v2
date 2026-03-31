import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasActions = canEdit || canDelete || canLock || canPin || canMove;

  const computePosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    // Estimate dropdown height based on number of actions
    const numActions =
      (canEdit ? 1 : 0) +
      (canDelete ? 1 : 0) +
      (canLock ? 1 : 0) +
      (canPin ? 1 : 0) +
      (canMove ? 1 : 0);
    const estimatedHeight = numActions * 36 + 12;

    if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
      // Flip upward
      setDropdownStyle({
        position: "fixed",
        bottom: viewportHeight - rect.top + 4,
        right: window.innerWidth - rect.right,
        width: "9rem",
      });
    } else {
      // Below button, right-aligned
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        width: "9rem",
      });
    }
  }, [canEdit, canDelete, canLock, canPin, canMove]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!hasActions) return null;

  const handleToggle = () => {
    if (!open) computePosition();
    setOpen((v) => !v);
  };

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="p-1 bg-gray-700 border border-gray-600 rounded shadow-xl z-[9999] py-1"
        >
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
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        variant="secondaryOutline"
        size="xs"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        ···
      </Button>
      {dropdown}
    </div>
  );
};
