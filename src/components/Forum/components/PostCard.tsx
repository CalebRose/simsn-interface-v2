import React, { useState } from "react";
import {
  Post,
  ReactionType,
  REACTION_LABELS,
  RichTextDocument,
  CreateReportDTO,
} from "../../../models/forumModels";
import { Text } from "../../../_design/Typography";
import { Button } from "../../../_design/Buttons";
import { RichTextRenderer } from "./RichTextRenderer";
import { ModerationControls } from "./ModerationControls";
import { ReportPostModal } from "./ReportPostModal";
import { ForumPermissions } from "../../../models/forumModels";
import { useAuthStore } from "../../../context/AuthContext";

interface PostCardProps {
  post: Post;
  currentUserId: string | null;
  permissions: ForumPermissions;
  isThreadLocked: boolean;
  canBypassLock?: boolean;
  hideLeadingFeatureImage?: boolean;
  onReact: (postId: string, reaction: ReactionType) => void;
  onReply: (post: Post) => void;
  onQuote: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onReport: (dto: CreateReportDTO) => Promise<void>;
}

function formatTimestamp(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "";
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  permissions,
  isThreadLocked,
  canBypassLock = false,
  hideLeadingFeatureImage = false,
  onReact,
  onReply,
  onQuote,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { currentUser } = useAuthStore();
  const [showReactions, setShowReactions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const isOwnPost = post.author.uid === currentUserId;
  const canEdit =
    permissions.canEditAnyPost || (isOwnPost && permissions.canEditOwnPost);
  const canDelete =
    permissions.canDeleteAnyPost || (isOwnPost && permissions.canDeleteOwnPost);

  if (post.isDeleted) {
    return (
      <div
        id={`post-${post.id}`}
        className="py-3 px-3 border-b border-gray-700 last:border-b-0"
      >
        <Text variant="secondary" classes="italic text-sm">
          [This post has been removed.]
        </Text>
      </div>
    );
  }

  const reactionEntries = Object.entries(REACTION_LABELS) as [
    ReactionType,
    string,
  ][];

  return (
    <div
      id={`post-${post.id}`}
      className="flex flex-col py-3 px-3 border-b border-gray-800 last:border-b-0 gap-2"
    >
      {/* Header: author + timestamp */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {post.author.logoUrl && (
            <img
              src={post.author.logoUrl}
              alt=""
              className="w-8 h-8 object-contain flex-shrink-0 mt-0.5"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <Text variant="body-small" classes="font-semibold">
                {post.author.username}
              </Text>
              {post.replyToPostId && (
                <Text variant="xs" classes="text-gray-500">
                  ↩ replied
                </Text>
              )}
            </div>
            <Text variant="xs" classes="text-gray-500">
              {formatTimestamp(
                post.createdAt as unknown as { seconds: number },
              )}
              {post.isEdited && (
                <span className="ml-2 text-gray-600 italic">
                  {post.editedByUsername
                    ? `(edited by ${post.editedByUsername})`
                    : "(edited)"}
                </span>
              )}
            </Text>
          </div>
        </div>

        {/* Moderation controls */}
        <ModerationControls
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={() => onEdit(post)}
          onDelete={() => onDelete(post.id)}
        />
      </div>

      {/* Body */}
      <div className="text-sm">
        <RichTextRenderer
          document={post.body as RichTextDocument}
          fallback={post.bodyText}
          hideLeadingFeatureImage={hideLeadingFeatureImage}
        />
      </div>

      {/* Action bar */}
      {(!isThreadLocked || canBypassLock) && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {/* Reaction picker toggle */}
          <div className="relative">
            <Button
              variant="secondaryOutline"
              size="xs"
              onClick={() => setShowReactions((v) => !v)}
            >
              😀
            </Button>
            {showReactions && (
              <div className="absolute left-0 bottom-full mb-1 flex gap-1 bg-gray-800 border border-gray-600 rounded p-1 z-10 shadow-lg">
                {reactionEntries.map(([type, emoji]) => {
                  const count = post.reactions?.[type]?.length ?? 0;
                  const reacted = currentUserId
                    ? (post.reactions?.[type] ?? []).includes(currentUserId)
                    : false;
                  return (
                    <button
                      key={type}
                      title={type}
                      onClick={() => {
                        onReact(post.id, type);
                        setShowReactions(false);
                      }}
                      className={`text-lg px-1 py-0.5 rounded hover:bg-white/10 transition-colors ${
                        reacted ? "bg-blue-900" : ""
                      }`}
                    >
                      {emoji}
                      {count > 0 && (
                        <span className="text-xs ml-0.5">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Existing reactions summary */}
          <div className="flex flex-wrap gap-1">
            {reactionEntries
              .filter(([type]) => (post.reactions?.[type]?.length ?? 0) > 0)
              .map(([type, emoji]) => {
                const count = post.reactions![type]!.length;
                const reacted = currentUserId
                  ? post.reactions![type]!.includes(currentUserId)
                  : false;
                return (
                  <button
                    key={type}
                    onClick={() => onReact(post.id, type)}
                    className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded border transition-colors ${
                      reacted
                        ? "bg-blue-900 border-blue-600"
                        : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {emoji} {count}
                  </button>
                );
              })}
          </div>

          <Button
            variant="secondaryOutline"
            size="xs"
            onClick={() => onReply(post)}
          >
            Reply
          </Button>
          <Button
            variant="secondaryOutline"
            size="xs"
            onClick={() => onQuote(post)}
          >
            Quote
          </Button>
          {!isOwnPost && currentUserId && (
            <Button
              variant="secondaryOutline"
              size="xs"
              onClick={() => setShowReportModal(true)}
              title="Report this post"
            >
              🚩
            </Button>
          )}
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <ReportPostModal
          isOpen={showReportModal}
          post={post}
          onClose={() => setShowReportModal(false)}
          onSubmit={onReport}
        />
      )}
    </div>
  );
};
