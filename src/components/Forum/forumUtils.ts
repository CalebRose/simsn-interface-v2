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

function findImageUrlInNode(node: RichTextNode | undefined): string | null {
  if (!node) return null;

  const markImage = node.marks?.find((mark) => {
    const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
    return IMAGE_URL_PATTERN.test(href);
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
    if (IMAGE_URL_PATTERN.test(src)) return src;
  }

  if (node.type === "text" && typeof node.text === "string") {
    if (IMAGE_URL_PATTERN.test(node.text.trim())) {
      return node.text.trim();
    }
  }

  for (const child of node.content ?? []) {
    const childImage = findImageUrlInNode(child);
    if (childImage) return childImage;
  }

  return null;
}

export function extractForumEditorialImage(
  body: RichTextDocument | null | undefined,
): string | null {
  if (!body?.content?.length) return null;

  for (const node of body.content) {
    const imageUrl = findImageUrlInNode(node);
    if (imageUrl) return imageUrl;
  }

  return null;
}

export function buildForumEditorialItems(
  threads: Thread[],
  forumsById: Map<string, Forum>,
  postsById: Map<string, Post>,
): ForumEditorialItem[] {
  return threads.map((thread) => ({
    thread,
    forum: forumsById.get(thread.forumId),
    heroImageUrl: extractForumEditorialImage(
      postsById.get(thread.firstPostId)?.body,
    ),
  }));
}
