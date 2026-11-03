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
import { AuthorBadge } from "./AuthorBadge";
import { IconButton } from "../../../_design/IconButton";
import { UserProfileCard } from "../../Common/UserProfileCard";

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
  const [profileCardActive, setProfileCardActive] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const copyPermalink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      window.prompt("Copy this link", url);
    }
  };
  const isOwnPost = post.author.uid === currentUserId;
  const canEdit =
    permissions.canEditAnyPost || (isOwnPost && permissions.canEditOwnPost);
  const canDelete =
    permissions.canDeleteAnyPost || (isOwnPost && permissions.canDeleteOwnPost);

  if (post.isDeleted) {
    return (
      <div
        id={`post-${post.id}`}
        className="py-3 px-3 border-b border-(--border-primary) last:border-b-0"
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
      className="flex flex-col py-3 px-3 border-b border-(--border-secondary) last:border-b-0 gap-2"
    >
      {/* Header: author + timestamp */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {/* Lazy-mount UserProfileCard — only activate on first hover/click so
              idle posts don't pay the hook + event-listener cost up front. */}
          {profileCardActive ? (
            <UserProfileCard
              uid={post.author.uid}
              username={post.author.username}
              logoUrl={post.author.logoUrl}
              triggerHover
            >
              <div className="flex items-start gap-2 text-start">
                {post.author.logoUrl && (
                  <img
                    src={post.author.logoUrl}
                    alt=""
                    className="w-8 h-8 object-contain shrink-0 mt-0.5"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 text-start">
                    <Text
                      variant="body-small"
                      classes="font-semibold hover:text-(--accent-primary) transition-colors"
                    >
                      {post.author.username}
                    </Text>
                    <AuthorBadge
                      role={post.author.role}
                      league={post.author.league}
                    />
                    {post.replyToPostId && (
                      <span className="text-xs text-(--text-muted)">
                        ↩ in reply
                      </span>
                    )}
                  </div>
                  <Text
                    variant="xs"
                    classes="text-(--text-muted) sm:text-[13px]! text-xs!"
                  >
                    {formatTimestamp(
                      post.createdAt as unknown as { seconds: number },
                    )}
                    {post.isEdited && (
                      <span className="ml-2 text-(--text-muted) italic">
                        {post.editedByUsername
                          ? `(edited by ${post.editedByUsername})`
                          : "(edited)"}
                      </span>
                    )}
                  </Text>
                </div>
              </div>
            </UserProfileCard>
          ) : (
            <div
              className="relative inline-block cursor-pointer text-start"
              onMouseEnter={() => setProfileCardActive(true)}
              onClick={() => setProfileCardActive(true)}
            >
              <div className="flex items-start gap-2 text-start">
                {post.author.logoUrl && (
                  <img
                    src={post.author.logoUrl}
                    alt=""
                    className="w-8 h-8 object-contain shrink-0 mt-0.5"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 text-start">
                    <Text
                      variant="body-small"
                      classes="font-semibold hover:text-(--accent-primary) transition-colors"
                    >
                      {post.author.username}
                    </Text>
                    <AuthorBadge
                      role={post.author.role}
                      league={post.author.league}
                    />
                    {post.replyToPostId && (
                      <span className="text-xs text-(--text-muted)">
                        ↩ in reply
                      </span>
                    )}
                  </div>
                  <Text
                    variant="xs"
                    classes="text-(--text-muted) sm:text-[13px]! text-xs!"
                  >
                    {formatTimestamp(
                      post.createdAt as unknown as { seconds: number },
                    )}
                    {post.isEdited && (
                      <span className="ml-2 text-(--text-muted) italic">
                        {post.editedByUsername
                          ? `(edited by ${post.editedByUsername})`
                          : "(edited)"}
                      </span>
                    )}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton label="Copy link to this post" onClick={copyPermalink}>
            {linkCopied ? "✓" : "🔗"}
          </IconButton>
          {/* Moderation controls (also hosts Report) */}
          <ModerationControls
            canEdit={canEdit}
            canDelete={canDelete}
            canReport={!isOwnPost && !!currentUserId}
            onReport={() => setShowReportModal(true)}
            onEdit={() => onEdit(post)}
            onDelete={() => onDelete(post.id)}
          />
        </div>
      </div>

      {/* Body */}
      <div className="text-[15px] leading-relaxed sm:text-sm">
        <RichTextRenderer
          document={post.body as RichTextDocument}
          fallback={post.bodyText}
          hideLeadingFeatureImage={hideLeadingFeatureImage}
        />
      </div>

      {/* Action bar */}
      {(!isThreadLocked || canBypassLock) && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {/* Reaction picker toggle; opens inline so it never covers post text */}
          <Button
            variant="secondaryOutline"
            size="xs"
            classes="min-h-11 sm:min-h-0"
            onClick={() => setShowReactions((v) => !v)}
            aria-expanded={showReactions}
            title="Add reaction"
          >
            😀
          </Button>
          {showReactions && (
            <div className="flex flex-wrap gap-1 bg-(--bg-secondary) border border-(--border-primary) rounded-sm p-1">
              {reactionEntries.map(([type, emoji]) => {
                const reacted = currentUserId
                  ? (post.reactions?.[type] ?? []).includes(currentUserId)
                  : false;
                return (
                  <button
                    key={type}
                    title={type}
                    aria-label={`React ${type}`}
                    onClick={() => {
                      onReact(post.id, type);
                      setShowReactions(false);
                    }}
                    className={`text-lg px-2 py-1 min-h-10 rounded-sm hover:bg-(--text-primary)/10 transition-colors ${
                      reacted ? "bg-blue-900" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}

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
                    className={`flex items-center gap-1 text-sm px-2 py-1 min-h-9 rounded-sm border transition-colors ${
                      reacted
                        ? "bg-blue-900 border-blue-600"
                        : "bg-(--bg-secondary) border-(--border-primary) hover:bg-(--border-secondary)"
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
            classes="min-h-11 sm:min-h-0 text-(--text-secondary)"
            onClick={() => onReply(post)}
          >
            ↩ Reply
          </Button>
          <Button
            variant="secondaryOutline"
            size="xs"
            classes="min-h-11 sm:min-h-0 text-(--text-secondary)"
            onClick={() => onQuote(post)}
          >
            ❝ Quote
          </Button>
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
