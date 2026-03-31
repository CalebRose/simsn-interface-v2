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

export function isForumImageUrl(value: string | null | undefined): boolean {
  return !!value && IMAGE_URL_PATTERN.test(value.trim());
}

function getNodeTextContent(node: RichTextNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map((child) => getNodeTextContent(child)).join("");
}

function findImageUrlInNode(node: RichTextNode | undefined): string | null {
  if (!node) return null;

  const markImage = node.marks?.find((mark) => {
    const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
    return isForumImageUrl(href);
  });
  if (markImage?.attrs?.href && typeof markImage.attrs.href === "string") {
    return markImage.attrs.href;
  }

  if (node.type === "image") {
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

  for (const child of node.content ?? []) {
    const childImage = findImageUrlInNode(child);
    if (childImage) return childImage;
  }

  return null;
}

function isEmptyTopLevelNode(node: RichTextNode): boolean {
  return !getNodeTextContent(node).trim() && !findImageUrlInNode(node);
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
  const imageUrl = findImageUrlInNode(firstNode);
  if (!imageUrl) return -1;

  const textContent = getNodeTextContent(firstNode).trim();
  if (!textContent || isForumImageUrl(textContent) || textContent === imageUrl) {
    return firstNonEmptyIndex;
  }

  return -1;
}

export function extractForumEditorialImage(
  body: RichTextDocument | null | undefined,
): string | null {
  const featureNodeIndex = getLeadingFeatureNodeIndex(body);
  if (featureNodeIndex === -1 || !body) return null;

  return findImageUrlInNode(body.content[featureNodeIndex]);
}

export function removeForumFeatureImage(
  body: RichTextDocument | null | undefined,
): RichTextDocument | null | undefined {
  const featureNodeIndex = getLeadingFeatureNodeIndex(body);
  if (featureNodeIndex === -1 || !body) return body;

  return {
    ...body,
    content: body.content.filter((_, index) => index !== featureNodeIndex),
  };
}

export function forumDocToPlaintext(
  doc: RichTextDocument | null | undefined,
): string {
  if (!doc?.content?.length) return "";

  function extractText(node: RichTextNode): string {
    if (node.type === "text") return node.text ?? "";
    if (!node.content) return "";
    return node.content.map(extractText).join(node.type === "paragraph" ? "\n" : "");
  }

  return doc.content.map(extractText).join("\n");
}

export function buildForumContentPreview(
  body: RichTextDocument | null | undefined,
  maxLength = 200,
): string {
  const previewText = buildForumBodyText(body)
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return previewText.slice(0, maxLength);
}

export function buildForumBodyText(
  body: RichTextDocument | null | undefined,
): string {
  return forumDocToPlaintext(removeForumFeatureImage(body));
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
      extractForumEditorialImage(postsById.get(thread.firstPostId)?.body),
  }));
}
