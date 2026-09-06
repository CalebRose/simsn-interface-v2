import React from "react";
import { TocEntry } from "../../_helper/markdownDocsHelper";

interface DocTableOfContentsProps {
  toc: TocEntry[];
  activeId?: string | null;
  onSelect: (id: string) => void;
}

const indentByLevel: Record<number, string> = {
  1: "pl-0 font-semibold",
  2: "pl-2",
  3: "pl-4",
  4: "pl-6",
};

export const DocTableOfContents: React.FC<DocTableOfContentsProps> = ({
  toc,
  activeId,
  onSelect,
}) => {
  if (toc.length === 0) return null;

  return (
    <nav className="w-full min-w-0 space-y-0.5 text-xs">
      {toc.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onSelect(entry.id)}
          className={`block w-full min-w-0 max-w-full truncate rounded appearance-none bg-transparent border-0 text-left px-1.5 py-0.5 transition-colors ${
            indentByLevel[entry.level] || "pl-0"
          } ${
            activeId === entry.id
              ? "text-yellow-400"
              : "text-gray-300 hover:text-white hover:bg-gray-700/50"
          }`}
        >
          {entry.text}
        </button>
      ))}
    </nav>
  );
};
