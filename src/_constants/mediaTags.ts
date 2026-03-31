// Media forum tag definitions.
// Tags are used to categorize threads posted inside the Media forum
// and its sport-specific subforums.

export type MediaTag =
  | "article"
  | "press-conference"
  | "rankings"
  | "podcast"
  | "interview";

export interface MediaTagDef {
  value: MediaTag;
  label: string;
  color: string; // Tailwind bg class
}

export const MEDIA_TAGS: MediaTagDef[] = [
  { value: "article", label: "Article", color: "bg-sky-700" },
  {
    value: "press-conference",
    label: "Press Conference",
    color: "bg-violet-700",
  },
  { value: "rankings", label: "Rankings", color: "bg-amber-700" },
  { value: "podcast", label: "Podcast", color: "bg-emerald-700" },
  { value: "interview", label: "Interview", color: "bg-rose-700" },
];

export const MEDIA_TAG_MAP = Object.fromEntries(
  MEDIA_TAGS.map((t) => [t.value, t]),
) as Record<MediaTag, MediaTagDef>;

/** Returns true if the given forum id is the Media top-level forum or one of
 *  its sport subforums (media-simcfb, media-simnfl, etc.). */
export function isMediaForum(forumId: string): boolean {
  return forumId === "media" || forumId.startsWith("media-");
}
