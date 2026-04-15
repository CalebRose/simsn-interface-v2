import React from "react";
import {
  Post,
  ForumPermissions,
  ReactionType,
  CreateReportDTO,
} from "../../../models/forumModels";
import { PostCard } from "./PostCard";
import { LoadSpinner } from "../../../_design/LoadSpinner";
import { Text } from "../../../_design/Typography";

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  currentUserId: string | null;
  permissions: ForumPermissions;
  isThreadLocked: boolean;
  canBypassLock?: boolean;
  onReact: (postId: string, reaction: ReactionType) => void;
  onReply: (post: Post) => void;
  onQuote: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onReport: (dto: CreateReportDTO) => Promise<void>;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  isLoading,
  currentUserId,
  permissions,
  isThreadLocked,
  canBypassLock = false,
  onReact,
  onReply,
  onQuote,
  onEdit,
  onDelete,
  onReport,
}) => {
  if (isLoading) return <LoadSpinner />;

  if (posts.length === 0) {
    return (
      <div className="py-6 text-center">
        <Text variant="secondary">No posts yet.</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          permissions={permissions}
          isThreadLocked={isThreadLocked}
          canBypassLock={canBypassLock}
          onReact={onReact}
          onReply={onReply}
          onQuote={onQuote}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
        />
      ))}
    </div>
  );
};
