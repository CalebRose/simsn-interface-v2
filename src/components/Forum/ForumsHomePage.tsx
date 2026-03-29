import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { ForumCard } from "./components/ForumCard";
import { useForums } from "../../_hooks/useForumHooks";
import { useForumStore } from "../../context/ForumContext";
import { Forum } from "../../models/forumModels";
import routes from "../../_constants/routes";
import { useAuthStore } from "../../context/AuthContext";

export const ForumsHomePage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { forums, forumsLoading } = useForums();
  const { permissions } = useForumStore();
  const navigate = useNavigate();

  // Separate top-level forums from subforums and build a map
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

  const canViewForums = useMemo(() => {
    if (!currentUser) return false;
    if (
      currentUser.roleID === "Admin" ||
      currentUser.roleID === "admin" ||
      currentUser.IsSubscribed ||
      (currentUser.roleID &&
        currentUser.roleID.toLowerCase().includes("commissioner"))
    ) {
      return true;
    }
    return false;
  }, [currentUser]);

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
      <div className="flex flex-col w-full px-4">
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

        {/* Forum grid */}
        {topLevel.length === 0 && !forumsLoading ? (
          <div className="py-12 text-center">
            <Text variant="secondary">No forums available.</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:w-[80vw]">
            {topLevel.map((forum) => (
              <ForumCard
                key={forum.id}
                forum={forum}
                subforums={subforumMap.get(forum.id) ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
