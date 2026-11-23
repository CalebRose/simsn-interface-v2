import React, { useEffect, useRef, useState, ReactNode } from "react";
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
  /** Override classes on the scrollable content wrapper (default: "mt-4 overflow-y-auto text-gray-700 dark:text-gray-300"). Use "overflow-hidden" for split-panel layouts that manage their own scroll. */
  bodyClass?: string;
  /** Override the overlay stacking class (default "z-50"), e.g. to open above full-screen drawers. */
  zIndexClass?: string;
  /**
   * Opt-in for form modals: below the `sm` breakpoint the modal fills the
   * screen and shrinks to sit above the on-screen keyboard, so the footer and
   * actions stay visible while typing. Larger screens are unchanged apart from
   * using dynamic viewport units.
   */
  mobileSheet?: boolean;
  /** Default true. Turn off for forms, so a stray tap outside can't discard what was typed. */
  closeOnOutsideClick?: boolean;
  /** Pinned between the scrolling body and the actions, e.g. a live summary of a form. */
  footer?: ReactNode;
}

const SMALL_SCREEN_QUERY = "(max-width: 639px)";

/**
 * The visible area on small screens, which shrinks when the on-screen keyboard
 * opens. Null when inactive or on larger screens, where the layout is left alone.
 */
const useSmallScreenViewport = (active: boolean) => {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    if (!active || typeof window === "undefined") {
      setBox(null);
      return;
    }
    const vv = window.visualViewport;
    const media = window.matchMedia(SMALL_SCREEN_QUERY);
    const update = () => {
      if (!media.matches || !vv) {
        setBox(null);
        return;
      }
      setBox({ top: vv.offsetTop, height: vv.height });
    };
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    media.addEventListener("change", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      media.removeEventListener("change", update);
    };
  }, [active]);
  return box;
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  classes = "",
  maxWidth = "max-w-xl",
  bodyClass,
  zIndexClass = "z-50",
  mobileSheet = false,
  closeOnOutsideClick = true,
  footer,
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

  const viewport = useSmallScreenViewport(isOpen && mobileSheet);

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
    if (isOpen && closeOnOutsideClick) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // ✅ Cleanup event listener on unmount or when closed
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, closeOnOutsideClick]);

  // 🔄 If modal isn't open, don't render anything
  if (!isOpen) return null;

  const overlayClass = mobileSheet
    ? "items-stretch sm:items-center"
    : "items-center";
  const panelClass = mobileSheet
    ? "h-full rounded-none p-3 sm:h-auto sm:max-h-[90dvh] sm:rounded-lg sm:p-4"
    : "max-h-[90vh] rounded-lg p-4";

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex ${overlayClass} justify-center bg-black/50`}
      style={viewport ? { top: viewport.top, height: viewport.height, bottom: "auto" } : undefined}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 shadow-lg w-full ${maxWidth} ${panelClass} flex flex-col ${classes}`}
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
        <div
          className={`flex-1 min-h-0 ${
            bodyClass !== undefined
              ? bodyClass
              : "mt-4 text-gray-700 dark:text-gray-300 overflow-y-auto"
          }`}
        >
          {children}
        </div>

        {footer && (
          <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600 shrink-0">
            {footer}
          </div>
        )}

        {/* ✅ Modal Actions */}
        {actions && (
          <div className={`${mobileSheet || footer ? "mt-3" : "mt-6"} flex justify-end space-x-2 shrink-0`}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
