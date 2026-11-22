import { parser, RuleType, MarkdownToJSX } from "markdown-to-jsx";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/**
 * Uses the renderer's parser so formatted and repeated headings use the same
 * text and unique IDs as the rendered document.
 */
export const parseMarkdownHeadings = (markdown: string): TocEntry[] => {
  const textOf = (nodes: MarkdownToJSX.ASTNode[]): string =>
    nodes.map((node) => {
      if ("children" in node && Array.isArray(node.children)) {
        return textOf(node.children);
      }
      return "text" in node ? node.text : "";
    }).join("");

  return parser(markdown).flatMap((node) => {
    if (node.type !== RuleType.heading || node.level > 4 || !node.id) return [];
    return [{
      id: node.id,
      text: textOf(node.children),
      level: node.level,
    }];
  });
};

/** Removes exported heading anchor annotations unsupported by the renderer. */
export const normalizeMarkdownHeadings = (markdown: string): string => {
  let fence: string | null = null;
  return markdown.replace(/\r\n?/g, "\n").split("\n").map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      return line;
    }
    if (!fence && /^#{1,6}\s/.test(line)) {
      return line.replace(/\s+\{#[^}]+\}\s*$/, "");
    }
    return line;
  }).join("\n");
};

/**
 * Removes the author's own "Table of Contents" section from the markdown body
 * since the sidebar renders a generated TOC in its place.
 */
export const stripEmbeddedToc = (markdown: string): string => {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const startIndex = lines.findIndex((line) =>
    /^#{1,2}\s+Table of Contents\s*$/i.test(line.trim()),
  );
  if (startIndex === -1) {
    // Some exported documents contain an unlabeled block of TOC links.
    for (let start = 0; start < lines.length; start++) {
      if (!/^\s*\[.+\]\(#.+\)\s*$/.test(lines[start])) continue;
      let end = start;
      let linkCount = 0;
      while (end < lines.length) {
        if (/^\s*\[.+\]\(#.+\)\s*$/.test(lines[end])) linkCount++;
        else if (lines[end].trim()) break;
        end++;
      }
      if (linkCount >= 5 && /^#{1,2}\s+\S/.test(lines[end] ?? "")) {
        return [...lines.slice(0, start), ...lines.slice(end)].join("\n");
      }
      start = end - 1;
    }
    return markdown;
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (/^#{1,2}\s+\S/.test(lines[i])) {
      endIndex = i;
      break;
    }
  }

  return [...lines.slice(0, startIndex), ...lines.slice(endIndex)].join("\n");
};