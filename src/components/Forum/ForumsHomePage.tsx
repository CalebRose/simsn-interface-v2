import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { FilterChip } from "../../_design/FilterChip";
import { UnderlineTabs } from "../../_design/UnderlineTabs";
import { ForumCard } from "./components/ForumCard";
import { ForumEditorialSection } from "./components/ForumEditorialSection";
import { LastViewedThreadsSidebar } from "./components/LastViewedThreadsSidebar";
import { LatestThreadsSidebar } from "./components/LatestThreadsSidebar";
import {
  useForumEditorialItems,
  useForums,
  useLastViewedThreads,
  useLatestThreads,
} from "../../_hooks/useForumHooks";
import { useForumStore } from "../../context/ForumContext";
import {
  canGuestPostInForum,
  canSubscriberPostInForum,
} from "../../context/ForumContext";
import { Forum } from "../../models/forumModels";
import routes from "../../_constants/routes";
import { useAuthStore } from "../../context/AuthContext";
import { useResponsive } from "../../_hooks/useMobile";
import { getLeagueKey, isSystemGeneratedThread } from "./forumUtils";
import { MagnifyingGlass } from "../../_design/Icons";

const LEAGUE_LABELS: Record<string, string> = {
  simcfb: "CFB",
  simnfl: "NFL",
  simcbb: "CBB",
  simnba: "NBA",
  simchl: "CHL",
  simphl: "PHL",
  simcbl: "CBL",
  simmlb: "MLB",
  simclax: "CLax",
};
const LEAGUE_ORDER = Object.keys(LEAGUE_LABELS);
const LEAGUE_STORAGE_KEY = "forumLeagueFilter";

type MobileTab = "categories" | "latest" | "viewed";

export const ForumsHomePage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { forums, forumsLoading } = useForums();
  const { permissions, forumRole } = useForumStore();
  const navigate = useNavigate();

  const { isMobile } = useResponsive();
  const [mobileTab, setMobileTab] = useState<MobileTab>("categories");
  const [discussionOnly, setDiscussionOnly] = useState(true);
  const [leagueFilter, setLeagueFilter] = useState<string>(() => {
    try {
      return localStorage.getItem(LEAGUE_STORAGE_KEY) ?? "all";
    } catch {
      return "all";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LEAGUE_STORAGE_KEY, leagueFilter);
    } catch {
      // storage unavailable; filter just won't persist
    }
  }, [leagueFilter]);

  const { topLevel, subforumMap, leagues } = useMemo(() => {
    const topLevel: Forum[] = [];
    const subforumMap: Map<string, Forum[]> = new Map();
    const present = new Set<string>();

    for (const f of forums) {
      if (f.type === "top_level" || !f.parentForumId) {
        topLevel.push(f);
      } else {
        const parent = f.parentForumId;
        if (!subforumMap.has(parent)) subforumMap.set(parent, []);
        subforumMap.get(parent)!.push(f);
        const key = getLeagueKey(f.id, f.sportKey);
        if (key) present.add(key);
      }
    }

    const leagues = LEAGUE_ORDER.filter((k) => present.has(k));
    return { topLevel, subforumMap, leagues };
  }, [forums]);

  // Fall back to "all" if a stored league no longer exists.
  const activeLeague =
    leagueFilter !== "all" && leagues.includes(leagueFilter)
      ? leagueFilter
      : "all";

  const filteredCategories = useMemo(() => {
    if (activeLeague === "all") {
      return topLevel.map((forum) => ({
        forum,
        subforums: subforumMap.get(forum.id) ?? [],
      }));
    }
    const result: { forum: Forum; subforums: Forum[] }[] = [];
    for (const forum of topLevel) {
      const subs = subforumMap.get(forum.id) ?? [];
      const hasLeagueSubs = subs.some((s) => getLeagueKey(s.id, s.sportKey));
      if (!hasLeagueSubs) {
        // Shared categories (Daily, Off-Topic, ...) stay visible for every league.
        result.push({ forum, subforums: subs });
        continue;
      }
      const matching = subs.filter((s) => {
        const key = getLeagueKey(s.id, s.sportKey);
        return !key || key === activeLeague;
      });
      if (matching.some((s) => getLeagueKey(s.id, s.sportKey) === activeLeague))
        result.push({ forum, subforums: matching });
    }
    return result;
  }, [topLevel, subforumMap, activeLeague]);

  // All users that have at least one team can view the forums.
  const canViewForums = useMemo(() => {
    if (!currentUser) return false;
    return true;
  }, [currentUser]);

  const { editorialItems, editorialLoading } = useForumEditorialItems(
    forums,
    forumsLoading,
    canViewForums,
  );

  const lastViewedThreads = useLastViewedThreads(currentUser?.id);
  const { threads: latestThreadsRaw, loading: latestThreadsLoading } =
    useLatestThreads(canViewForums);

  const latestThreads = useMemo(
    () =>
      latestThreadsRaw.filter((t) => {
        if (discussionOnly && isSystemGeneratedThread(t)) return false;
        if (activeLeague === "all") return true;
        const key = getLeagueKey(t.forumId);
        return !key || key === activeLeague;
      }),
    [latestThreadsRaw, discussionOnly, activeLeague],
  );

  const filteredEditorial = useMemo(() => {
    const matching =
      activeLeague === "all"
        ? editorialItems
        : editorialItems.filter(
            (i) =>
              getLeagueKey(
                i.forum?.id ?? i.thread.forumId,
                i.forum?.sportKey,
              ) === activeLeague,
          );
    return matching.slice(0, 3);
  }, [editorialItems, activeLeague]);

  if (!canViewForums)
    return (
      <PageContainer isLoading={forumsLoading} title="">
        <div className="w-full max-w-6xl mx-auto">
          <Text variant="h4" classes="mb-4">
            Community Forums
          </Text>
          <Text variant="secondary">
            Please log in or register to access the forums. New users can post
            in the Introductions &amp; Job Applications sections right away.
          </Text>
        </div>
      </PageContainer>
    );

  const subscriberCanPost =
    forumRole === "subscriber"
      ? forums.some((f) => canSubscriberPostInForum(f))
      : forumRole === "guest"
        ? forums.some((f) => canGuestPostInForum(f))
        : false;

  return (
    <PageContainer isLoading={forumsLoading} title="">
      <div className="mx-auto flex w-full flex-col px-3 sm:px-4 lg:w-full py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <Text variant="h4">Forums</Text>

          <div className="flex items-center gap-2 space-x-1">
            {/* League filter chips */}
            {leagues.length > 0 &&
              ["all", ...leagues].map((key) => {
                const active = key === activeLeague;
                return (
                  <FilterChip
                    key={key}
                    size="md"
                    active={active}
                    onClick={() => setLeagueFilter(key)}
                  >
                    {key === "all" ? "All" : LEAGUE_LABELS[key]}
                  </FilterChip>
                );
              })}
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => navigate(routes.FORUM_SEARCH)}
            >
              <div className="flex items-center">
                <span aria-label="Search forums">
                  <MagnifyingGlass textColorClass="text-(--text-primary)" />
                </span>
                <span className="hidden sm:inline ml-1">Search</span>
              </div>
            </Button>
            {(permissions.canCreateThread || subscriberCanPost) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(routes.FORUM_CREATE_THREAD)}
              >
                + <span className="hidden sm:inline">New Thread</span>
                <span className="sm:hidden">New</span>
              </Button>
            )}
          </div>
        </div>

        <ForumEditorialSection
          items={filteredEditorial}
          isLoading={editorialLoading}
        />

        {/* Forum grid */}
        {topLevel.length === 0 && !forumsLoading ? (
          <div className="py-12 text-center">
            <Text variant="secondary">No forums available.</Text>
          </div>
        ) : isMobile ? (
          <section className="flex w-full flex-col text-left">
            <UnderlineTabs
              classes="mb-3"
              tabs={
                [
                  ["categories", "Categories"],
                  ["latest", "Latest"],
                  ["viewed", "Last viewed"],
                ] as [MobileTab, string][]
              }
              value={mobileTab}
              onChange={setMobileTab}
            />

            {mobileTab === "categories" && (
              <div className="grid grid-cols-1 gap-3">
                {filteredCategories.map(({ forum, subforums }) => (
                  <ForumCard
                    key={forum.id}
                    forum={forum}
                    subforums={subforums}
                  />
                ))}
              </div>
            )}
            {mobileTab === "latest" && (
              <>
                <DiscussionToggle
                  value={discussionOnly}
                  onChange={setDiscussionOnly}
                />
                <LatestThreadsSidebar
                  threads={latestThreads}
                  isLoading={latestThreadsLoading}
                />
              </>
            )}
            {mobileTab === "viewed" && (
              <LastViewedThreadsSidebar threads={lastViewedThreads} />
            )}
          </section>
        ) : (
          <section className="flex w-full flex-col gap-0 text-left">
            <div className="grid grid-cols-12 gap-4 border-b border-(--text-primary)/10 pb-3">
              <div className="col-span-2 flex flex-col justify-end">
                <Text variant="h5">Last Viewed Threads</Text>
                <Text variant="secondary" classes="mt-1">
                  Your last viewed threads
                </Text>
              </div>
              <div className="col-span-8 flex flex-col justify-end">
                <Text variant="h5">Forum Categories</Text>
                <Text variant="secondary" classes="mt-1">
                  Browse every conference room, subforum, and discussion hub.
                </Text>
              </div>
              <div className="col-span-2 flex flex-col justify-end">
                <Text variant="h5">Latest Threads</Text>
                <DiscussionToggle
                  value={discussionOnly}
                  onChange={setDiscussionOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start pt-4">
              <div className="col-span-2">
                <LastViewedThreadsSidebar threads={lastViewedThreads} />
              </div>
              <div className="col-span-8">
                <div className="grid grid-cols-1 gap-4">
                  {filteredCategories.map(({ forum, subforums }) => (
                    <ForumCard
                      key={forum.id}
                      forum={forum}
                      subforums={subforums}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <LatestThreadsSidebar
                  threads={latestThreads}
                  isLoading={latestThreadsLoading}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
};

const DiscussionToggle: React.FC<{
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ value, onChange }) => (
  <label className="mt-1 flex min-h-9 cursor-pointer items-center gap-2 text-xs sm:text-[13px] text-(--text-muted)">
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
    Hide postgame &amp; applications
  </label>
);
