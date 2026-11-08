import React, { useMemo, useState } from "react";
import { Thread } from "../../../models/forumModels";
import { ThreadListItem } from "./ThreadListItem";
import { Text } from "../../../_design/Typography";
import { LoadSpinner } from "../../../_design/LoadSpinner";
import { FilterChip } from "../../../_design/FilterChip";
import { Button } from "../../../_design/Buttons";
import { MEDIA_TAG_MAP, MediaTag } from "../../../_constants/mediaTags";
import { useAuthStore } from "../../../context/AuthContext";
import { useLastViewedThreads } from "../../../_hooks/useForumHooks";

interface ThreadListProps {
  threads: Thread[];
  pinnedThreads: Thread[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

type SortKey = "activity" | "replies" | "views";

const secondsOf = (t: Thread) => t.latestActivityAt?.seconds ?? 0;

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  pinnedThreads,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("activity");
  const [compact, setCompact] = useState<boolean>(
    () => localStorage.getItem("forumThreadDensity") === "compact",
  );
  const { currentUser } = useAuthStore();
  const viewed = useLastViewedThreads(currentUser?.id);
  const viewedMap = useMemo(
    () => new Map(viewed.map((v) => [v.threadId, v.viewedAt])),
    [viewed],
  );
  const toggleCompact = () => {
    const next = !compact;
    setCompact(next);
    try {
      localStorage.setItem(
        "forumThreadDensity",
        next ? "compact" : "comfortable",
      );
    } catch {
      // density just won't persist
    }
  };

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of threads) {
      for (const tag of t.tags ?? []) {
        if (MEDIA_TAG_MAP[tag as MediaTag]) set.add(tag);
      }
    }
    return [...set];
  }, [threads]);

  const visibleThreads = useMemo(() => {
    const filtered =
      tagFilter === "all"
        ? threads
        : threads.filter((t) => t.tags?.includes(tagFilter));
    const sorted = [...filtered];
    if (sort === "replies")
      sorted.sort((a, b) => (b.replyCount ?? 0) - (a.replyCount ?? 0));
    else if (sort === "views")
      sorted.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    else sorted.sort((a, b) => secondsOf(b) - secondsOf(a));
    return sorted;
  }, [threads, tagFilter, sort]);

  if (isLoading && threads.length === 0 && pinnedThreads.length === 0) {
    return <LoadSpinner />;
  }

  const allEmpty = threads.length === 0 && pinnedThreads.length === 0;

  if (!isLoading && allEmpty) {
    return (
      <div className="py-10 text-center">
        <Text variant="secondary">No threads yet. Be the first to post!</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {(availableTags.length > 0 || threads.length > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by type"
          >
            {availableTags.length > 0 &&
              ["all", ...availableTags].map((tag) => (
                <FilterChip
                  key={tag}
                  active={tagFilter === tag}
                  onClick={() => setTagFilter(tag)}
                >
                  {tag === "all" ? "All" : MEDIA_TAG_MAP[tag as MediaTag].label}
                </FilterChip>
              ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleCompact}
              aria-pressed={compact}
              className="min-h-9 rounded-sm border border-(--text-primary)/15 px-3 text-sm text-(--text-secondary) hover:bg-(--text-primary)/10"
            >
              {compact ? "Compact" : "Comfortable"}
            </button>
            <label className="flex items-center gap-2 text-sm text-(--text-muted)">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="min-h-9 rounded-sm border border-(--text-primary)/15 bg-transparent px-2 text-sm text-(--text-secondary)"
              >
                <option value="activity">Last activity</option>
                <option value="replies">Most replies</option>
                <option value="views">Most viewed</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {pinnedThreads.length > 0 && (
        <>
          {pinnedThreads.map((t) => (
            <ThreadListItem
              key={t.id}
              thread={t}
              compact={compact}
              viewedAt={viewedMap.get(t.id)}
            />
          ))}
          {visibleThreads.length > 0 && (
            <div className="border-t border-(--border-primary) my-1" />
          )}
        </>
      )}

      {visibleThreads.map((t) => (
        <ThreadListItem
          key={t.id}
          thread={t}
          compact={compact}
          viewedAt={viewedMap.get(t.id)}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
};
