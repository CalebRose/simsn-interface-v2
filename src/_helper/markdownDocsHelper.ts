import { slugify } from "markdown-to-jsx";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/**
 * Parses `#`-style markdown headings into a flat TOC list. IDs are generated
 * with markdown-to-jsx's own `slugify`, matching the ids it assigns to
 * rendered headings so sidebar links line up with in-page anchors.
 */
export const parseMarkdownHeadings = (markdown: string): TocEntry[] => {
  const toc: TocEntry[] = [];
  let inCodeBlock = false;

  // Normalize CRLF/CR so the trailing \r doesn't break the `(.*)$` heading match
  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,4})\s+(.*)$/);
    if (!match) continue;

    const text = match[2].trim();
    if (!text) continue;

    toc.push({
      id: slugify(text),
      text,
      level: match[1].length,
    });
  }

  return toc;
};

/**
 * Removes the author's own "Table of Contents" section from the markdown body
 * since the sidebar renders a generated TOC in its place, and the original
 * links/page numbers don't resolve to real in-page anchors.
 */
export const stripEmbeddedToc = (markdown: string): string => {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const startIndex = lines.findIndex((line) =>
    /^#{1,2}\s+Table of Contents\s*$/i.test(line.trim()),
  );
  if (startIndex === -1) return markdown;

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (/^#{1,2}\s+\S/.test(lines[i])) {
      endIndex = i;
      break;
    }
  }

  return [...lines.slice(0, startIndex), ...lines.slice(endIndex)].join("\n");
};
