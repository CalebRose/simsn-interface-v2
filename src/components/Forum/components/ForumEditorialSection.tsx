import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../../_constants/routes";
import { ForumBorder } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { ForumEditorialItem } from "../forumUtils";

interface ForumEditorialSectionProps {
  items: ForumEditorialItem[];
  isLoading?: boolean;
}

function formatRelativeTime(
  ts: { seconds: number } | null | undefined,
): string {
  if (!ts) return "Just now";
  const now = Date.now();
  const then = ts.seconds * 1000;
  const diff = Math.max(0, Math.floor((now - then) / 1000));

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
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
      isFeaturedCard(index) ? "min-h-[26rem] lg:row-span-2" : "min-h-[12.75rem]"
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

  return (
    <ForumBorder
      classes={`group relative min-w-0 overflow-hidden p-0 mb-0 ${
        featured ? "min-h-[26rem] lg:row-span-2" : "min-h-[12.75rem]"
      }`}
    >
      {item.heroImageUrl && (
        <>
          <img
            src={item.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/45" />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-slate-950/0 transition-colors duration-200 group-hover:bg-slate-950/30" />

      <button
        type="button"
        onClick={() => navigate(`${routes.FORUM_THREAD}/${item.thread.id}`)}
        className={`relative flex w-full appearance-none cursor-pointer flex-col justify-between overflow-hidden border-0 bg-transparent p-0 text-left focus:outline-none hover:bg-transparent hover:border-transparent lg:h-full ${
          featured ? "min-h-[26rem] lg:min-h-0" : "min-h-[12.75rem] lg:min-h-0"
        }`}
      >
        <div className="relative flex items-start justify-between gap-3 p-5 pb-0 lg:p-6 lg:pb-0">
          <div className="inline-flex items-center gap-2 rounded-md border-white/10 border bg-black/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-md bg-white" />
            {item.forum?.name ?? "Forum"}
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-widest">
            Editorial Content
          </div>
        </div>

        <div className="relative flex h-full flex-col justify-end gap-3 p-5 lg:p-6">
          <div className="space-y-2">
            <h3
              className={`max-w-3xl font-semibold tracking-wide text-balance text-center lg:text-left ${
                featured ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl"
              }`}
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                textShadow: "0 3px 16px rgba(0, 0, 0, 0.55)",
              }}
            >
              {item.thread.title}
            </h3>
            {item.thread.contentPreview && (
              <p
                className={`hidden line-clamp-3 text-white/78 sm:block ${
                  featured ? "max-w-2xl text-sm sm:text-base" : "max-w-xl text-sm"
                }`}
                style={{ textShadow: "0 3px 14px rgba(0, 0, 0, 0.5)" }}
              >
                {formatEditorialSnippet(item.thread.contentPreview)}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
            <div className="min-w-0">
              <Text variant="body-small" classes="text-white/70 font-semibold text-start">
                by {item.thread.author.username}
              </Text>
              <Text variant="xs" classes="text-white/60 uppercase tracking-[0.18em] text-start">
                Media Spotlight
              </Text>
            </div>
            <Text variant="body-small" classes="shrink-0 text-[#fff4df] text-right">
              {formatRelativeTime(
                item.thread.latestActivityAt as unknown as { seconds: number },
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
          <div className="space-y-3">
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
                  className="rounded-md border border-[var(--border-secondary)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-white/80 transition-opacity hover:opacity-90"
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
                      className={`h-2.5 w-2.5 rounded-full transition-opacity ${
                        index === mobileIndex ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileIndex((prev) => (prev + 1) % visibleItems.length)
                  }
                  className="rounded-md border border-[var(--border-secondary)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-white/80 transition-opacity hover:opacity-90"
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
