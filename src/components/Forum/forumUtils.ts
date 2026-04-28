import {
  Forum,
  Post,
  RichTextDocument,
  RichTextNode,
  Thread,
} from "../../models/forumModels";

const IMAGE_URL_PATTERN =
  /^https?:\/\/\S+\.(?:jpe?g|png|gif|webp|svg)(?:\?[^\s]*)?$/i;

export interface ForumEditorialItem {
  thread: Thread;
  forum?: Forum;
  heroImageUrl: string | null;
}

export interface ParsedForumBody {
  featureImageUrl: string | null;
  documentWithoutFeatureImage: RichTextDocument | null | undefined;
  bodyTextWithoutFeatureImage: string;
  previewWithoutFeatureImage: string;
}

export function isForumImageUrl(value: string | null | undefined): boolean {
  return !!value && IMAGE_URL_PATTERN.test(value.trim());
}

function getNodeTextContent(node: RichTextNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? [])
    .map((child) => getNodeTextContent(child))
    .join("");
}

function getImageUrlFromNode(node: RichTextNode | undefined): string | null {
  if (!node) return null;

  const markImage = node.marks?.find((mark) => {
    const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
    return isForumImageUrl(href);
  });
  if (markImage?.attrs?.href && typeof markImage.attrs.href === "string") {
    return markImage.attrs.href;
  }

  if (node.type === "image" || node.type === "forumImage") {
    const src =
      typeof node.attrs?.src === "string"
        ? node.attrs.src
        : typeof node.attrs?.href === "string"
          ? node.attrs.href
          : typeof node.attrs?.url === "string"
            ? node.attrs.url
            : "";
    if (isForumImageUrl(src)) return src;
  }

  if (node.type === "text" && typeof node.text === "string") {
    if (isForumImageUrl(node.text)) {
      return node.text.trim();
    }
  }

  return null;
}

function getImageUrlFromTopLevelNode(
  node: RichTextNode | undefined,
): string | null {
  if (!node) return null;

  const nodeImageUrl = getImageUrlFromNode(node);
  if (nodeImageUrl) return nodeImageUrl;

  for (const child of node.content ?? []) {
    const childImageUrl = getImageUrlFromNode(child);
    if (childImageUrl) return childImageUrl;
  }

  return null;
}

function isEmptyTopLevelNode(node: RichTextNode): boolean {
  return !getNodeTextContent(node).trim() && !getImageUrlFromTopLevelNode(node);
}

function getLeadingFeatureNodeIndex(
  body: RichTextDocument | null | undefined,
): number {
  if (!body?.content?.length) return -1;

  const firstNonEmptyIndex = body.content.findIndex(
    (node) => !isEmptyTopLevelNode(node),
  );
  if (firstNonEmptyIndex === -1) return -1;

  const firstNode = body.content[firstNonEmptyIndex];
  const imageUrl = getImageUrlFromTopLevelNode(firstNode);
  if (!imageUrl) return -1;

  const textContent = getNodeTextContent(firstNode).trim();

  // Accept when the node has no text, when the text IS the image URL (raw paste),
  // or when the text exactly matches the discovered URL.
  if (
    !textContent ||
    isForumImageUrl(textContent) ||
    textContent === imageUrl
  ) {
    return firstNonEmptyIndex;
  }

  // Also accept when every child node that carries text is itself an image-linked
  // node (i.e. the user applied the 🔗 toolbar to custom display text like
  // "hq720.jpg (1280×720)" and pointed it at the real image URL). In that case
  // there is no non-image text mixed in, so the whole node is purely a feature image.
  const hasMixedTextContent = (firstNode.content ?? []).some((child) => {
    if (!getNodeTextContent(child).trim()) return false;
    return !getImageUrlFromNode(child);
  });
  if (!hasMixedTextContent) return firstNonEmptyIndex;

  return -1;
}

function forumDocToPlaintext(
  body: RichTextDocument | null | undefined,
): string {
  if (!body?.content?.length) return "";

  function extractText(node: RichTextNode): string {
    if (node.type === "text") return node.text ?? "";
    if (!node.content) return "";
    return node.content
      .map(extractText)
      .join(node.type === "paragraph" ? "\n" : "");
  }

  return body.content.map(extractText).join("\n");
}

export function parseForumBody(
  body: RichTextDocument | null | undefined,
  maxPreviewLength = 200,
): ParsedForumBody {
  const featureNodeIndex = getLeadingFeatureNodeIndex(body);
  const featureImageUrl =
    featureNodeIndex !== -1 && body
      ? getImageUrlFromTopLevelNode(body.content[featureNodeIndex])
      : null;

  const documentWithoutFeatureImage =
    featureNodeIndex !== -1 && body
      ? {
          ...body,
          content: body.content.filter(
            (_, index) => index !== featureNodeIndex,
          ),
        }
      : body;

  const bodyTextWithoutFeatureImage = forumDocToPlaintext(
    documentWithoutFeatureImage,
  );
  const previewWithoutFeatureImage = bodyTextWithoutFeatureImage
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxPreviewLength);

  return {
    featureImageUrl,
    documentWithoutFeatureImage,
    bodyTextWithoutFeatureImage,
    previewWithoutFeatureImage,
  };
}

export function buildForumEditorialItems(
  threads: Thread[],
  forumsById: Map<string, Forum>,
  postsById: Map<string, Post>,
): ForumEditorialItem[] {
  return threads.map((thread) => ({
    thread,
    forum: forumsById.get(thread.forumId),
    heroImageUrl:
      thread.featureImageUrl ??
      parseForumBody(postsById.get(thread.firstPostId)?.body).featureImageUrl,
  }));
}

// ─────────────────────────────────────────────
// Content Quality Analysis
// ─────────────────────────────────────────────

export type ContentQualityLevel = "good" | "moderate" | "low";

export interface ContentQualityResult {
  wordCount: number;
  uniqueWordRatio: number; // 0–1
  maxConsecutiveRepeatedChars: number;
  dominantWordFrequency: number; // 0–1 (fraction of total words the most-common word takes up)
  level: ContentQualityLevel;
  flags: string[];
}

/** Analyzes the plain-text body of a post for basic content quality signals. */
export function analyzeContentQuality(bodyText: string): ContentQualityResult {
  const trimmed = bodyText.trim();
  const words = trimmed.length > 0 ? trimmed.split(/\s+/) : [];
  const wordCount = words.length;

  // Unique word ratio
  const lowerWords = words.map((w) => w.toLowerCase());
  const uniqueWords = new Set(lowerWords);
  const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

  // Dominant word frequency (most-common single word / total)
  const freq: Record<string, number> = {};
  for (const w of lowerWords) freq[w] = (freq[w] ?? 0) + 1;
  const maxFreq = wordCount > 0 ? Math.max(...Object.values(freq)) : 0;
  const dominantWordFrequency = wordCount > 0 ? maxFreq / wordCount : 0;

  // Max consecutive identical characters (e.g. "aaaaaaaaaa")
  let maxRun = 1;
  let curRun = 1;
  for (let i = 1; i < trimmed.length; i++) {
    if (trimmed[i] === trimmed[i - 1] && trimmed[i] !== " ") {
      curRun++;
      if (curRun > maxRun) maxRun = curRun;
    } else {
      curRun = 1;
    }
  }
  const maxConsecutiveRepeatedChars = trimmed.length > 0 ? maxRun : 0;

  // Build flags
  const flags: string[] = [];
  if (wordCount < 20) flags.push("Very short post");
  else if (wordCount < 75) flags.push("Short post");
  if (uniqueWordRatio < 0.4 && wordCount >= 5)
    flags.push("Highly repetitive words");
  else if (uniqueWordRatio < 0.5 && wordCount >= 10)
    flags.push("Repetitive language");
  if (dominantWordFrequency > 0.5 && wordCount >= 5)
    flags.push("One word dominates content");
  if (maxConsecutiveRepeatedChars >= 8)
    flags.push("Repeated character spam detected");

  // Overall level
  let level: ContentQualityLevel = "good";
  if (
    wordCount < 20 ||
    uniqueWordRatio < 0.4 ||
    dominantWordFrequency > 0.5 ||
    maxConsecutiveRepeatedChars >= 8
  ) {
    level = "low";
  } else if (wordCount < 75 || uniqueWordRatio < 0.5) {
    level = "moderate";
  }

  return {
    wordCount,
    uniqueWordRatio,
    maxConsecutiveRepeatedChars,
    dominantWordFrequency,
    level,
    flags,
  };
}
