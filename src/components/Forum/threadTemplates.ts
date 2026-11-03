import { RichTextDocument, RichTextNode } from "../../models/forumModels";

const heading = (text: string): RichTextNode => ({
  type: "heading",
  attrs: { level: 3 },
  content: [{ type: "text", text }],
});

const prompt = (): RichTextNode => ({ type: "paragraph" });

const build = (sections: string[]): RichTextDocument => ({
  type: "doc",
  content: sections.flatMap((s) => [heading(s), prompt()]),
});

export interface ThreadTemplate {
  label: string;
  doc: RichTextDocument;
}

/** Prefilled bodies keyed by forum id. */
export const THREAD_TEMPLATES: Record<string, ThreadTemplate> = {
  "welcome-suggestions-fixes": {
    label: "Suggestion / Fix template",
    doc: build([
      "Problem",
      "Proposed change",
      "Who it affects",
      "Additional context",
    ]),
  },
  "welcome-league-proposals": {
    label: "League proposal template",
    doc: build([
      "Summary",
      "Current behavior",
      "Proposed change",
      "Impact on leagues",
    ]),
  },
};

export const POSTING_GUIDELINES = [
  "Pick the forum that matches your league so others can find it.",
  "Use a specific title: it appears in lists and search.",
  "Search first; a similar thread may already exist.",
  "Be respectful. Reports go to the moderators.",
];
