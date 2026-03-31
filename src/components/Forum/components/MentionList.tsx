import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface MentionItem {
  uid: string;
  username: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

export interface MentionListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const MentionList = forwardRef<MentionListHandle, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    // Reset selected index when items change
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) return null;

    return (
      <div
        ref={listRef}
        className="mention-list z-50 overflow-hidden rounded-lg border border-gray-600 bg-gray-800 shadow-xl"
        style={{ minWidth: "160px", maxWidth: "260px" }}
      >
        {items.map((item, index) => (
          <button
            key={item.uid}
            type="button"
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
              index === selectedIndex
                ? "bg-yellow-500/20 text-yellow-300"
                : "text-gray-200 hover:bg-white/10"
            }`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className="font-medium text-yellow-400">@</span>
            <span>{item.username}</span>
          </button>
        ))}
      </div>
    );
  },
);

MentionList.displayName = "MentionList";
