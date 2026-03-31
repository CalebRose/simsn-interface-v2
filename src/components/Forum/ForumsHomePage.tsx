import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { ForumCard } from "./components/ForumCard";
import { ForumEditorialSection } from "./components/ForumEditorialSection";
import { useForumEditorialItems, useForums } from "../../_hooks/useForumHooks";
import { useForumStore } from "../../context/ForumContext";
import { Forum } from "../../models/forumModels";
import routes from "../../_constants/routes";
import { useAuthStore } from "../../context/AuthContext";

export const ForumsHomePage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { forums, forumsLoading } = useForums();
  const { permissions } = useForumStore();
  const navigate = useNavigate();

  const { topLevel, subforumMap } = useMemo(() => {
    const topLevel: Forum[] = [];
    const subforumMap: Map<string, Forum[]> = new Map();

    for (const f of forums) {
      if (f.type === "top_level" || !f.parentForumId) {
        topLevel.push(f);
      } else {
        const parent = f.parentForumId;
        if (!subforumMap.has(parent)) subforumMap.set(parent, []);
        subforumMap.get(parent)!.push(f);
      }
    }

    return { topLevel, subforumMap };
  }, [forums]);

  const canViewForums = !!(
    currentUser && (
      currentUser.roleID === "Admin" ||
      currentUser.roleID === "admin" ||
      currentUser.IsSubscribed ||
      currentUser.roleID?.toLowerCase().includes("commissioner")
    )
  );

  const { editorialItems, editorialLoading } = useForumEditorialItems(
    forums,
    forumsLoading,
    canViewForums,
  );

  if (!canViewForums)
    return (
      <PageContainer isLoading={forumsLoading} title="">
        <div className="w-full max-w-6xl mx-auto">
          <Text variant="h4" classes="mb-4">
            Community Forums
          </Text>
          <Text variant="secondary">This isn't ready for you yet.</Text>
        </div>
      </PageContainer>
    );

  return (
    <PageContainer isLoading={forumsLoading} title="">
      <div className="mx-auto flex w-[95vw] flex-col lg:w-[80vw] py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 space-x-2">
          <Text variant="h4">Community Forums</Text>
          {permissions.canCreateThread && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(routes.FORUM_CREATE_THREAD)}
            >
              + New Thread
            </Button>
          )}
        </div>

        <ForumEditorialSection
          items={editorialItems}
          isLoading={editorialLoading}
        />

        {/* Forum grid */}
        {topLevel.length === 0 && !forumsLoading ? (
          <div className="py-12 text-center">
            <Text variant="secondary">No forums available.</Text>
          </div>
        ) : (
          <section className="flex w-full flex-col gap-3 text-left">
            <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <Text variant="h5">Forum Categories</Text>
                <Text variant="secondary" classes="mt-1">
                  Browse every conference room, subforum, and discussion hub.
                </Text>
              </div>
              <Text
                variant="body-small"
                classes="hidden sm:block text-white/45 uppercase tracking-[0.2em]"
              >
                Directory
              </Text>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {topLevel.map((forum) => (
                <ForumCard
                  key={forum.id}
                  forum={forum}
                  subforums={subforumMap.get(forum.id) ?? []}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
};
