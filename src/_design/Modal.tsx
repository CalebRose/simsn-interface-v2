import React, { useEffect, useRef, ReactNode } from "react";
import { Button } from "./Buttons";
import { Text } from "./Typography";

// Stack of currently-open modal ids, in open order. Only the topmost modal
// reacts to outside clicks, so an inner modal (e.g. a player card opened from a
// box score) can be dismissed without also closing the modal beneath it.
const modalStack: number[] = [];
let modalSeq = 0;

// 🔑 Define Props Interface for Modal
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: string;
  classes?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  classes = "",
  maxWidth = "max-w-xl",
}) => {
  // ✅ Strongly Typed Ref
  const modalRef = useRef<HTMLDivElement | null>(null);
  // Stable per-instance id for the open-modal stack (lazy init, no render side effect)
  const idRef = useRef(0);
  if (idRef.current === 0) idRef.current = ++modalSeq;

  // Register/unregister this modal in the open-modal stack while it's open.
  useEffect(() => {
    if (!isOpen) return;
    const id = idRef.current;
    modalStack.push(id);
    return () => {
      const i = modalStack.lastIndexOf(id);
      if (i !== -1) modalStack.splice(i, 1);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only the topmost modal closes on an outside click; a modal stacked
      // underneath must ignore clicks meant for the one above it.
      if (modalStack[modalStack.length - 1] !== idRef.current) return;
      const target = event.target as HTMLElement;
      // If click was inside our modal, ignore
      if (modalRef.current?.contains(target)) return;
      if (
        target.closest(".my-select__control") ||
        target.closest(".my-select__menu") ||
        target.closest(".my-select__clear-indicator")
      ) {
        return;
      }
      onClose();
    };

    // ✅ Add event listener only if the modal is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // ✅ Cleanup event listener on unmount or when closed
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 🔄 If modal isn't open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-black/50">
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full ${maxWidth} max-h-[90vh] flex flex-col p-6 ${classes}`}
      >
        {/* ✅ Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 shrink-0">
          <Text
            variant="h4"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </Text>
          <Button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={onClose}
            aria-label="Close Modal"
            size="sm"
          >
            &times;
          </Button>
        </div>

        {/* ✅ Modal Content */}
        <div className="mt-4 text-gray-700 dark:text-gray-300 flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>

        {/* ✅ Modal Actions */}
        {actions && (
          <div className="mt-6 flex justify-end space-x-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};
