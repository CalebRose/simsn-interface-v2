import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../../_constants/routes";
import { ForumBorder } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import {
  ForumEditorialItem,
  cleanExcerpt,
  formatRelativeTime,
} from "../forumUtils";

interface ForumEditorialSectionProps {
  items: ForumEditorialItem[];
  isLoading?: boolean;
}

function formatEditorialSnippet(snippet: string): string {
  const trimmed = snippet.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("...") ? trimmed : `${trimmed}...`;
}

function isFeaturedCard(index: number): boolean {
  return index === 0;
}

const SkeletonCard: React.FC<{ index: number }> = ({ index }) => (
  <ForumBorder
    classes={`relative min-w-0 overflow-hidden p-0 mb-0 ${
      isFeaturedCard(index) ? "min-h-104 lg:row-span-2" : "min-h-51"
    }`}
  >
    <div className="relative flex h-full flex-col justify-end gap-3 p-5 lg:p-6 animate-pulse">
      <div className="h-6 w-24 rounded-md bg-white/10" />
      <div className="h-5 w-2/3 rounded-md bg-white/10" />
      <div className="h-5 w-3/4 rounded-md bg-white/10" />
      <div className="h-4 w-1/2 rounded-md bg-white/10" />
    </div>
  </ForumBorder>
);

const EditorialCard: React.FC<{
  item: ForumEditorialItem;
  index: number;
}> = ({ item, index }) => {
  const navigate = useNavigate();
  const featured = isFeaturedCard(index);
  const excerpt = cleanExcerpt(item.thread.contentPreview);

  return (
    <ForumBorder
      classes={`group relative min-w-0 overflow-hidden p-0 mb-0 ${
        featured ? "min-h-56 sm:min-h-104 lg:row-span-2" : "min-h-51"
      }`}
    >
      {item.heroImageUrl ? (
        <>
          <img
            src={item.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-900 to-black" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-slate-950/0 transition-colors duration-200 group-hover:bg-slate-950/30" />

      <button
        type="button"
        onClick={() => navigate(`${routes.FORUM_THREAD}/${item.thread.id}`)}
        className={`relative flex w-full appearance-none cursor-pointer flex-col justify-between overflow-hidden border-0 bg-transparent p-0 text-left focus:outline-hidden hover:bg-transparent hover:border-transparent lg:h-full ${
          featured ? "min-h-56 sm:min-h-104 lg:min-h-0" : "min-h-51 lg:min-h-0"
        }`}
      >
        <div className="relative flex items-start justify-between gap-3 p-4 pb-0 sm:p-5 sm:pb-0 lg:p-6 lg:pb-0">
          <div
            className={`inline-flex items-center gap-2 rounded-md border-white/10 border bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white`}
          >
            <span className="h-1.5 w-1.5 rounded-md bg-white" />
            {item.forum?.name ?? "Forum"}
          </div>
        </div>

        <div className="relative flex h-full flex-col justify-end gap-3 p-4 sm:p-5 lg:p-6">
          <div className="space-y-2">
            <h3
              className={`max-w-3xl font-semibold tracking-wide text-white text-balance text-left ${
                featured
                  ? "text-2xl sm:text-4xl lg:text-5xl"
                  : "text-xl sm:text-3xl"
              }`}
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                textShadow: "0 3px 16px rgba(0, 0, 0, 0.55)",
              }}
            >
              {item.thread.title}
            </h3>
            {excerpt && (
              <p
                className={`hidden line-clamp-3 text-white/90 sm:block ${
                  featured
                    ? "max-w-2xl text-sm sm:text-base"
                    : "max-w-xl text-sm"
                }`}
                style={{ textShadow: "0 3px 14px rgba(0, 0, 0, 0.5)" }}
              >
                {formatEditorialSnippet(excerpt)}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-3">
            <Text
              variant="body-small"
              classes="min-w-0 truncate text-white/80 font-semibold text-start"
            >
              by {item.thread.author.username}
            </Text>
            <Text
              variant="body-small"
              classes="shrink-0 text-[#fff4df] text-right"
            >
              {formatRelativeTime(
                item.thread.latestActivityAt as unknown as { seconds: number },
                "Just now",
              )}
            </Text>
          </div>
        </div>
      </button>
    </ForumBorder>
  );
};

export const ForumEditorialSection: React.FC<ForumEditorialSectionProps> = ({
  items,
  isLoading = false,
}) => {
  const visibleItems = items.slice(0, 3);
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMobileIndex(0);
  }, [visibleItems.length]);

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="mb-8 w-full">
      <div className="lg:hidden">
        {isLoading && visibleItems.length === 0 ? (
          <SkeletonCard index={0} />
        ) : visibleItems.length > 0 ? (
          <div
            className="space-y-3"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(dx) < 50 || visibleItems.length < 2) return;
              setMobileIndex((prev) =>
                dx < 0
                  ? (prev + 1) % visibleItems.length
                  : (prev - 1 + visibleItems.length) % visibleItems.length,
              );
            }}
          >
            <EditorialCard
              key={visibleItems[mobileIndex].thread.id}
              item={visibleItems[mobileIndex]}
              index={0}
            />

            {visibleItems.length > 1 && (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setMobileIndex((prev) =>
                      prev === 0 ? visibleItems.length - 1 : prev - 1,
                    )
                  }
                  className="rounded-md border border-(--border-secondary) bg-(--bg-secondary) px-3 py-2 min-h-11 text-sm text-(--text-primary) transition-opacity hover:opacity-90"
                >
                  Prev
                </button>

                <div className="flex items-center gap-2">
                  {visibleItems.map((item, index) => (
                    <button
                      key={item.thread.id}
                      type="button"
                      onClick={() => setMobileIndex(index)}
                      aria-label={`Go to editorial item ${index + 1}`}
                      className="flex h-11 w-6 items-center justify-center"
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-opacity ${
                          index === mobileIndex ? "bg-white" : "bg-white/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileIndex((prev) => (prev + 1) % visibleItems.length)
                  }
                  className="rounded-md border border-(--border-secondary) bg-(--bg-secondary) px-3 py-2 min-h-11 text-sm text-(--text-primary) transition-opacity hover:opacity-90"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="hidden grid-cols-1 gap-4 lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:grid-rows-2">
        {isLoading && visibleItems.length === 0
          ? Array.from({ length: 3 }, (_, index) => (
              <SkeletonCard key={index} index={index} />
            ))
          : visibleItems.map((item, index) => (
              <EditorialCard key={item.thread.id} item={item} index={index} />
            ))}
      </div>
    </section>
  );
};
