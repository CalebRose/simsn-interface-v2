import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { ForumBorder } from "../../_design/Borders";
import { ForumBreadcrumbs } from "./components/ForumBreadcrumbs";
import { PostList } from "./components/PostList";
import { ForumEditor } from "./components/ForumEditor";
import { PollBlock } from "./components/PollBlock";
import { GameReferenceCard } from "./components/GameReferenceCard";
import { ModerationControls } from "./components/ModerationControls";
import { useThread } from "../../_hooks/useForumHooks";
import { useForumStore } from "../../context/ForumContext";
import { useAuthStore } from "../../context/AuthContext";
import { ForumService } from "../../_services/forumService";
import {
  Post,
  RichTextDocument,
  PostMention,
  GameReference,
  CreatePostDTO,
} from "../../models/forumModels";
import { plaintextToDoc } from "./components/ForumEditor";
import { parseForumBody } from "./forumUtils";
import routes from "../../_constants/routes";
import { MEDIA_TAG_MAP, MediaTag } from "../../_constants/mediaTags";
import { ThreadSEOMeta } from "./components/ThreadSEOMeta";

interface Params {
  threadId: string;
}

export const ThreadPage: React.FC = () => {
  const { threadId } = useParams<keyof Params>() as Params;
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const {
    permissions,
    createPost,
    updatePost,
    softDeletePost,
    lockThread,
    unlockThread,
    pinThread,
    unpinThread,
    softDeleteThread,
    moveThread,
    reactToPost,
    submitPollVote,
    changeVote,
    updatePollSettings,
    togglePoll,
    reportPost,
    isMuted,
    muteExpiresAt,
    forums,
  } = useForumStore();

  const { activeThread, posts, postsLoading, activePoll, userPollVote } =
    useThread(threadId);

  const [gameRef, setGameRef] = useState<GameReference | null>(null);
  const [replyingTo, setReplyingTo] = useState<Post | null>(null);
  const [quotingPost, setQuotingPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [modReason, setModReason] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetForumId, setMoveTargetForumId] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  // Load game reference if applicable
  useEffect(() => {
    if (!activeThread?.referencedGameId) return;
    ForumService.GetGameReferenceById(activeThread.referencedGameId)
      .then(setGameRef)
      .catch(console.error);
  }, [activeThread?.referencedGameId]);

  const forumSlug = activeThread?.forumPath?.[0] ?? "";
  const crumbs = [
    { label: "Forums", href: routes.FORUMS },
    ...(forumSlug
      ? [
          {
            label: forumSlug.toUpperCase(),
            href: `${routes.FORUMS}/${forumSlug}`,
          },
        ]
      : []),
    { label: activeThread?.title ?? "Thread" },
  ];

  const handleReply = async (
    doc: RichTextDocument,
    plainText: string,
    mentions: PostMention[],
  ) => {
    if (!activeThread || !currentUser) return;
    setIsSubmitting(true);
    try {
      let body = doc;
      let bodyText = plainText;

      if (quotingPost) {
        // Prepend quote block
        const quoteNode = {
          type: "quoteReference" as const,
          attrs: {
            postId: quotingPost.id,
            authorUsername: quotingPost.author.username,
          },
          content: [
            { type: "text" as const, text: quotingPost.bodyText.slice(0, 200) },
          ],
        };
        body = {
          type: "doc",
          content: [quoteNode, ...doc.content],
        };
        bodyText = `[Quote: ${quotingPost.author.username}]\n${plainText}`;
      }

      const dto: CreatePostDTO = {
        threadId: activeThread.id,
        forumId: activeThread.forumId,
        body,
        bodyText,
        replyToPostId: replyingTo?.id ?? null,
        quotedPostId: quotingPost?.id ?? null,
        mentions,
      };

      await createPost(dto);
      setReplyingTo(null);
      setQuotingPost(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (
    doc: RichTextDocument,
    plainText: string,
    mentions: PostMention[],
  ) => {
    if (!editingPost) return;
    setIsSubmitting(true);
    try {
      await updatePost(editingPost.id, {
        body: doc,
        bodyText: plainText,
        mentions,
      });
      setEditingPost(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    await softDeletePost(postId, modReason || undefined);
    setShowDeleteConfirm(null);
    setModReason("");
  };

  const handleDeleteThread = async () => {
    if (!threadId) return;
    await softDeleteThread(threadId, modReason || undefined);
    navigate(
      activeThread?.forumPath?.[0]
        ? `${routes.FORUMS}/${activeThread.forumPath[0]}`
        : routes.FORUMS,
    );
  };

  const handleMoveThread = async () => {
    if (!activeThread || !moveTargetForumId) return;
    setIsMoving(true);
    try {
      await moveThread(
        activeThread.id,
        moveTargetForumId,
        moveReason || undefined,
      );
      setShowMoveModal(false);
      setMoveTargetForumId("");
      setMoveReason("");
    } finally {
      setIsMoving(false);
    }
  };

  const isLocked = activeThread?.isLocked ?? false;
  const isAdmin = permissions.canLockThread;
  const canReply = permissions.canReply && (!isLocked || isAdmin);
  const threadHeroImageUrl = useMemo(() => {
    if (!activeThread) return null;
    if (activeThread.featureImageUrl) return activeThread.featureImageUrl;
    const firstPost = posts.find(
      (post) => post.id === activeThread.firstPostId,
    );
    return parseForumBody(firstPost?.body).featureImageUrl;
  }, [activeThread, posts]);

  return (
    <PageContainer isLoading={!activeThread && postsLoading} title="">
      {activeThread && (
        <ThreadSEOMeta thread={activeThread} threadId={threadId} />
      )}
      <div className="flex flex-col w-[90vw] lg:w-[80vw]">
        <ForumBreadcrumbs crumbs={crumbs} />

        {/* Thread header */}
        {activeThread && (
          <ForumBorder
            classes={`relative overflow-hidden p-0 mb-3 ${
              threadHeroImageUrl ? "min-h-[20rem] sm:min-h-[24rem]" : ""
            }`}
          >
            {threadHeroImageUrl && (
              <>
                <img
                  src={threadHeroImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/45" />
              </>
            )}
            <div
              className={`relative ${
                threadHeroImageUrl
                  ? "flex min-h-[20rem] flex-col justify-end p-5 sm:min-h-[38rem] sm:p-6 lg:p-6"
                  : "p-3 sm:p-4 lg:p-5"
              }`}
            >
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4 lg:right-5 lg:top-5">
                <ModerationControls
                  canEdit={false}
                  canDelete={permissions.canDeleteAnyPost}
                  canLock={permissions.canLockThread}
                  canPin={permissions.canPinThread}
                  canMove={
                    permissions.canMoveAnyThread ||
                    (!!currentUser &&
                      currentUser.id === activeThread.author.uid)
                  }
                  isLocked={isLocked}
                  isPinned={activeThread.isPinned}
                  onDelete={() => setShowDeleteConfirm("__thread__")}
                  onLock={() => lockThread(activeThread.id)}
                  onUnlock={() => unlockThread(activeThread.id)}
                  onPin={() => pinThread(activeThread.id)}
                  onUnpin={() => unpinThread(activeThread.id)}
                  onMove={() => {
                    setMoveTargetForumId(activeThread.forumId);
                    setShowMoveModal(true);
                  }}
                />
              </div>

              <div className="flex min-w-0 flex-col items-center text-center">
                <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
                  {activeThread.isPinned && (
                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                      Pinned
                    </span>
                  )}
                  {activeThread.isAnnouncement && (
                    <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">
                      Announcement
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs bg-yellow-600 text-white px-1.5 py-0.5 rounded">
                      🔒 Locked
                    </span>
                  )}
                  {activeThread.tags?.map((tag) => {
                    const def = MEDIA_TAG_MAP[tag as MediaTag];
                    if (!def) return null;
                    return (
                      <span
                        key={tag}
                        className={`text-xs ${def.color} text-white px-1.5 py-0.5 rounded`}
                      >
                        {def.label}
                      </span>
                    );
                  })}
                </div>
                <h1
                  className="max-w-5xl text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-wide text-balance"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {activeThread.title}
                </h1>
                <Text
                  variant="small"
                  classes={
                    threadHeroImageUrl
                      ? "mt-1 text-white/70"
                      : "mt-1 text-gray-400"
                  }
                >
                  {activeThread.replyCount} repl
                  {activeThread.replyCount !== 1 ? "ies" : "y"} · started by{" "}
                  {activeThread.author.username}
                </Text>
              </div>
            </div>
          </ForumBorder>
        )}

        {/* Game reference card */}
        {gameRef && (
          <div className="mb-3">
            <GameReferenceCard gameRef={gameRef} />
          </div>
        )}

        {/* Poll block */}
        {activePoll && activeThread && (
          <div className="mb-3">
            <PollBlock
              poll={activePoll}
              userVote={userPollVote}
              canVote={permissions.canVoteInPoll}
              onVote={submitPollVote}
              onChangeVote={changeVote}
              canManagePoll={
                permissions.canLockThread ||
                (!!currentUser && currentUser.id === activeThread.author.uid)
              }
              onTogglePoll={togglePoll}
              isOP={!!currentUser && currentUser.id === activeThread.author.uid}
              onUpdatePollSettings={updatePollSettings}
            />
          </div>
        )}

        {/* Locked banner */}
        {isLocked && (
          <div className="mb-3 p-2 bg-yellow-900/40 border border-yellow-700 rounded text-sm text-yellow-300">
            🔒 This thread has been locked by a moderator.
          </div>
        )}

        {/* Mute banner */}
        {isMuted && muteExpiresAt && (
          <div className="mb-3 p-2 bg-red-900/40 border border-red-700 rounded text-sm text-red-300">
            🔇 You have been muted from posting until{" "}
            <span className="font-semibold">
              {muteExpiresAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            . You may still read and react to posts.
          </div>
        )}

        {/* Posts */}
        <ForumBorder classes="p-0 overflow-hidden">
          <PostList
            posts={posts}
            isLoading={postsLoading}
            currentUserId={currentUser?.id ?? null}
            permissions={permissions}
            isThreadLocked={isLocked}
            canBypassLock={permissions.canLockThread}
            onReact={reactToPost}
            onReply={(post) => {
              setReplyingTo(post);
              setQuotingPost(null);
            }}
            onQuote={(post) => {
              setQuotingPost(post);
              setReplyingTo(null);
            }}
            onEdit={(post) => setEditingPost(post)}
            onDelete={(postId) => setShowDeleteConfirm(postId)}
            onReport={reportPost}
          />
        </ForumBorder>

        {/* Edit post form */}
        {editingPost && (
          <div className="mt-4">
            <Text variant="h6" classes="mb-2">
              Editing post
            </Text>
            <ForumEditor
              initialDoc={editingPost.body}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingPost(null)}
              submitLabel="Save changes"
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Reply form */}
        {canReply && !editingPost && (
          <div className="mt-4">
            {(replyingTo || quotingPost) && (
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                {replyingTo && (
                  <span>
                    Replying to <strong>{replyingTo.author.username}</strong>
                  </span>
                )}
                {quotingPost && (
                  <span>
                    Quoting <strong>{quotingPost.author.username}</strong>
                  </span>
                )}
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setQuotingPost(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  ✕ Clear
                </button>
              </div>
            )}
            <ForumEditor
              placeholder="Write a reply…"
              onSubmit={handleReply}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {!canReply && !isLocked && !currentUser && (
          <div className="mt-4 text-center py-4">
            <Text variant="secondary">Sign in to reply.</Text>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 max-w-sm w-full">
              <Text variant="h6" classes="mb-3">
                {showDeleteConfirm === "__thread__"
                  ? "Delete this thread?"
                  : "Delete this post?"}
              </Text>
              <Text variant="secondary" classes="text-sm mb-3">
                This action will soft-delete the content. It can be restored by
                a moderator.
              </Text>
              <textarea
                value={modReason}
                onChange={(e) => setModReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={2}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 mb-3"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondaryOutline"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    setModReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (showDeleteConfirm === "__thread__") {
                      handleDeleteThread();
                    } else {
                      handleDeletePost(showDeleteConfirm);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Move thread modal */}
        {showMoveModal && activeThread && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 max-w-sm w-full">
              <Text variant="h6" classes="mb-3">
                Move thread
              </Text>
              <Text variant="secondary" classes="text-sm mb-3">
                Select the forum or subforum to move this thread to.
              </Text>
              <div className="flex flex-col gap-3">
                <select
                  value={moveTargetForumId}
                  onChange={(e) => setMoveTargetForumId(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  disabled={isMoving}
                >
                  <option value="">-- Select destination --</option>
                  {(() => {
                    const subsByParent = new Map<string, typeof forums>();
                    for (const f of forums) {
                      if (f.type === "subforum" && f.parentForumId) {
                        if (!subsByParent.has(f.parentForumId))
                          subsByParent.set(f.parentForumId, []);
                        subsByParent.get(f.parentForumId)!.push(f);
                      }
                    }
                    return forums
                      .filter(
                        (f) =>
                          (f.type === "top_level" || !f.parentForumId) &&
                          !f.isLocked,
                      )
                      .map((parent) => {
                        const children = subsByParent.get(parent.id) ?? [];
                        if (children.length > 0) {
                          return (
                            <optgroup key={parent.id} label={parent.name}>
                              {children
                                .filter((c) => !c.isLocked)
                                .map((child) => (
                                  <option key={child.id} value={child.id}>
                                    {child.name}
                                  </option>
                                ))}
                            </optgroup>
                          );
                        }
                        return (
                          <option key={parent.id} value={parent.id}>
                            {parent.name}
                          </option>
                        );
                      });
                  })()}
                </select>
                <textarea
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  placeholder="Reason (optional)"
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500"
                  disabled={isMoving}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="secondaryOutline"
                  size="sm"
                  onClick={() => {
                    setShowMoveModal(false);
                    setMoveTargetForumId("");
                    setMoveReason("");
                  }}
                  disabled={isMoving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMoveThread}
                  disabled={
                    !moveTargetForumId ||
                    moveTargetForumId === activeThread.forumId ||
                    isMoving
                  }
                >
                  {isMoving ? "Moving…" : "Move"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
