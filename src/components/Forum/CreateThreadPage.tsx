import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { Border, ForumBorder } from "../../_design/Borders";
import { ForumBreadcrumbs } from "./components/ForumBreadcrumbs";
import { ForumEditor } from "./components/ForumEditor";
import type { ForumEditorHandle } from "./components/ForumEditor";
import { useForumStore } from "../../context/ForumContext";
import {
  canGuestPostInForum,
  canSubscriberPostInForum,
} from "../../context/ForumContext";
import { useAuthStore } from "../../context/AuthContext";
import { useForumDraft } from "../../_hooks/useForumDraft";
import {
  Forum,
  RichTextDocument,
  PostMention,
  CreateThreadDTO,
  ThreadType,
  CreatePollDTO,
} from "../../models/forumModels";
import routes from "../../_constants/routes";
import { MEDIA_TAGS, MediaTag, isMediaForum } from "../../_constants/mediaTags";
import { THREAD_TEMPLATES, POSTING_GUIDELINES } from "./threadTemplates";
import { RichTextRenderer } from "./components/RichTextRenderer";

interface ThreadCreationDraft {
  title: string;
  threadType: ThreadType;
  doc: RichTextDocument | null;
}

const MAX_TITLE = 100;
const MAX_POLL_OPTIONS = 10;

export const CreateThreadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedForumId = searchParams.get("forumId");
  const referenceGameId = searchParams.get("referenceGameId");
  const referencedLeague = searchParams.get("league");

  const { currentUser } = useAuthStore();
  const { createThread, permissions, forumRole, forums, loadForums } =
    useForumStore();

  const [selectedForumId, setSelectedForumId] = useState(
    preselectedForumId ?? "",
  );

  // ── Draft persistence (scoped per user + forum) ───────────────────────────────
  // Key is null until both user and a forum are selected so nothing is persisted
  // until the user has actually chosen where to post.
  const threadDraftKey =
    currentUser && selectedForumId
      ? `forum_draft_new_thread_${currentUser.id}_${selectedForumId}`
      : null;
  const {
    draft: threadDraft,
    saveDraft: saveThreadDraft,
    clearDraft: clearThreadDraft,
    hasDraft: hasThreadDraft,
  } = useForumDraft<ThreadCreationDraft>(threadDraftKey);

  const [title, setTitle] = useState(threadDraft?.title ?? "");
  const [threadType, setThreadType] = useState<ThreadType>(
    threadDraft?.threadType ?? "standard",
  );
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollAllowResultsPreview, setPollAllowResultsPreview] = useState(false);
  const [pollAllowVoteChange, setPollAllowVoteChange] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMediaTags, setSelectedMediaTags] = useState<MediaTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<RichTextDocument | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false);
  const showDraftBanner = hasThreadDraft && !draftBannerDismissed;
  const bodyEditorRef = useRef<ForumEditorHandle>(null);
  // Holds the latest body doc so it can be included in draft snapshots triggered
  // by non-body field changes (e.g. title edits).
  const bodyDocRef = useRef<RichTextDocument | null>(threadDraft?.doc ?? null);

  // Sync form fields and editor content whenever the forum changes and a draft
  // for that forum is (or isn't) found in storage.
  const prevDraftKeyRef = useRef(threadDraftKey);
  useEffect(() => {
    if (prevDraftKeyRef.current === threadDraftKey) return;
    prevDraftKeyRef.current = threadDraftKey;
    setTitle(threadDraft?.title ?? "");
    setThreadType(threadDraft?.threadType ?? "standard");
    bodyDocRef.current = threadDraft?.doc ?? null;
    bodyEditorRef.current?.setContent(threadDraft?.doc ?? null);
    setDraftBannerDismissed(false);
  }, [threadDraftKey, threadDraft]);

  // Helper: snapshot the full form state and persist it.
  const saveDraftSnapshot = (overrides: Partial<ThreadCreationDraft> = {}) => {
    saveThreadDraft({
      title,
      threadType,
      doc: bodyDocRef.current,
      ...overrides,
    });
  };

  useEffect(() => {
    if (forums.length === 0) loadForums();
  }, [forums.length, loadForums]);

  useEffect(() => {
    if (preselectedForumId) setSelectedForumId(preselectedForumId);
  }, [preselectedForumId]);

  // Guests/subscribers can only create threads in forums that explicitly allow it.
  const limitedUserCanPost =
    !!currentUser &&
    (forumRole === "subscriber"
      ? forums.some((f) => canSubscriberPostInForum(f))
      : forumRole === "guest"
        ? forums.some((f) => canGuestPostInForum(f))
        : false);

  if (!permissions.canCreateThread && !limitedUserCanPost) {
    return (
      <PageContainer title="Create Thread">
        <div className="py-10 text-center">
          <Text variant="secondary">
            You do not have permission to create threads.
          </Text>
        </div>
      </PageContainer>
    );
  }

  const postableForums = forums.filter((f) => {
    if (f.isLocked) return false;
    if (permissions.canCreateThread) {
      return (
        f.visibility === "public" ||
        f.visibility === "guest" ||
        f.visibility === "subscriber" ||
        f.visibility === "members"
      );
    }
    // Guests can post in guest-visibility / open forums; subscribers also get subscriber-flagged forums
    if (forumRole === "guest") return canGuestPostInForum(f);
    if (forumRole === "subscriber") return canSubscriberPostInForum(f);
    return false;
  });

  // Build grouped structure: standalone top-level forums + optgroups for those with subforums
  const subsByParent = new Map<string, Forum[]>();
  for (const f of postableForums) {
    if (f.type === "subforum" && f.parentForumId) {
      if (!subsByParent.has(f.parentForumId))
        subsByParent.set(f.parentForumId, []);
      subsByParent.get(f.parentForumId)!.push(f);
    }
  }
  const standaloneForums: Forum[] = [];
  const groupedForums: { parent: Forum; children: Forum[] }[] = [];
  for (const f of postableForums) {
    if (f.type === "top_level" || !f.parentForumId) {
      const children = subsByParent.get(f.id) ?? [];
      if (children.length > 0) {
        groupedForums.push({ parent: f, children });
      } else {
        standaloneForums.push(f);
      }
    }
  }

  const selectedForum = postableForums.find((f) => f.id === selectedForumId);
  const selectedParent = selectedForum?.parentForumId
    ? (forums.find((f) => f.id === selectedForum.parentForumId) ?? null)
    : null;

  const handleAddPollOption = () => {
    if (pollOptions.length < MAX_POLL_OPTIONS) {
      setPollOptions((prev) => [...prev, ""]);
    }
  };

  const toggleMediaTag = (tag: MediaTag) => {
    setSelectedMediaTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleRemovePollOption = (idx: number) => {
    setPollOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePollOptionChange = (idx: number, value: string) => {
    setPollOptions((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const handleSubmit = async (
    doc: RichTextDocument,
    plainText: string,
    mentions: PostMention[],
  ) => {
    setError(null);

    if (!title.trim()) {
      setError("Thread title is required.");
      return;
    }
    if (title.trim().length > MAX_TITLE) {
      setError(`Title must be ${MAX_TITLE} characters or fewer.`);
      return;
    }
    if (!selectedForumId) {
      setError("Please select a forum.");
      return;
    }

    let poll: CreatePollDTO | null = null;
    if (threadType === "poll") {
      const validOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
      const unique = new Set(validOptions.map((o) => o.toLowerCase()));
      if (pollQuestion.trim().length === 0) {
        setError("Poll question is required.");
        return;
      }
      if (validOptions.length < 2) {
        setError("Poll requires at least 2 options.");
        return;
      }
      if (unique.size !== validOptions.length) {
        setError("Poll options must be unique.");
        return;
      }
      poll = {
        question: pollQuestion.trim(),
        options: validOptions,
        allowsMultipleVotes: false,
        maxSelectableOptions: 1,
        closesAt: null,
        allowResultsPreview: pollAllowResultsPreview,
        allowVoteChange: pollAllowVoteChange,
      };
    }

    setIsSubmitting(true);
    try {
      const cover = coverImageUrl.trim();
      if (cover && !/^https?:\/\/\S+$/i.test(cover)) {
        setError("Cover image must be a valid http(s) URL.");
        setIsSubmitting(false);
        return;
      }
      const finalDoc: RichTextDocument = cover
        ? {
            ...doc,
            content: [
              { type: "image", attrs: { src: cover, alt: "" } },
              ...(doc.content ?? []),
            ],
          }
        : doc;
      const forum = postableForums.find((f) => f.id === selectedForumId);
      const forumPath = forum?.parentForumId
        ? [
            forums.find((f) => f.id === forum.parentForumId)?.slug ?? "",
            forum.slug,
          ]
        : [forum?.slug ?? ""];

      const dto: CreateThreadDTO = {
        forumId: selectedForumId,
        forumPath,
        title: title.trim(),
        body: finalDoc,
        bodyText: plainText,
        threadType,
        tags: selectedMediaTags.length > 0 ? selectedMediaTags : [],
        poll,
        mentions,
        referencedGameId: referenceGameId ?? "",
        referencedLeague: referencedLeague ?? "",
      };

      const threadId = await createThread(dto);
      if (threadId) {
        clearThreadDraft();
        navigate(`${routes.FORUM_THREAD}/${threadId}`);
      } else {
        setError("Failed to create thread. Please try again.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const crumbs = [
    { label: "Forums", href: routes.FORUMS },
    ...(selectedParent
      ? [
          {
            label: selectedParent.name,
            href: `${routes.FORUMS}/${selectedParent.slug}`,
          },
        ]
      : []),
    ...(selectedForum
      ? [
          {
            label: selectedForum.name,
            href: selectedParent
              ? `${routes.FORUMS}/${selectedParent.slug}/${selectedForum.slug}`
              : `${routes.FORUMS}/${selectedForum.slug}`,
          },
        ]
      : []),
    { label: "New Thread" },
  ];

  return (
    <PageContainer title="">
      <div className="mx-auto flex w-[95vw] flex-col lg:w-[80vw]">
        <ForumBreadcrumbs crumbs={crumbs} />
        <Text variant="h4" classes="mb-4 text-start">
          Create New Thread
        </Text>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <ForumBorder classes="p-4 flex flex-col gap-4 text-start">
            {/* Draft restore banner */}
            {showDraftBanner && (
              <div className="flex items-center justify-between px-3 py-2 rounded-sm text-sm bg-blue-950/60 border border-blue-700/50 text-(--accent-primary)">
                <span>Draft restored — pick up where you left off.</span>
                <button
                  onClick={() => {
                    clearThreadDraft();
                    bodyEditorRef.current?.setContent(null);
                    setTitle("");
                    setThreadType("standard");
                    setDraftBannerDismissed(true);
                  }}
                  className="ml-4 text-xs text-(--accent-primary) hover:text-(--accent-primary) underline underline-offset-2"
                >
                  Discard draft
                </button>
              </div>
            )}

            {/* Forum selector */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Forum <span className="text-(--accent-error)">*</span>
              </label>
              <select
                value={selectedForumId}
                onChange={(e) => {
                  const newForumId = e.target.value;
                  setSelectedForumId(newForumId);
                  setSelectedMediaTags([]);
                }}
                className="bg-(--bg-secondary) border border-(--border-primary) rounded-sm p-2 text-sm text-(--text-primary) focus:outline-hidden focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">-- Select a forum --</option>
                {standaloneForums.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
                {groupedForums.map(({ parent, children }) => (
                  <optgroup key={parent.id} label={parent.name}>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Thread type */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Thread type</span>
              <div className="flex gap-3">
                {(["standard", "poll"] as ThreadType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    <input
                      type="radio"
                      name="threadType"
                      value={type}
                      checked={threadType === type}
                      onChange={() => {
                        setThreadType(type);
                        saveDraftSnapshot({ threadType: type });
                      }}
                      className="accent-blue-500"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Media tags — shown only when posting in a media forum */}
            {isMediaForum(selectedForumId) && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Media type{" "}
                  <span className="text-(--text-muted) font-normal">(optional)</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {MEDIA_TAGS.map((tag) => {
                    const active = selectedMediaTags.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => toggleMediaTag(tag.value)}
                        disabled={isSubmitting}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? `${tag.color} text-white border-transparent`
                            : "bg-transparent text-(--text-muted) border-(--border-primary) hover:border-(--text-muted)"
                        }`}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Title <span className="text-(--accent-error)">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  saveDraftSnapshot({ title: newTitle });
                }}
                placeholder="Thread title…"
                maxLength={MAX_TITLE}
                className="bg-(--bg-secondary) border border-(--border-primary) rounded-sm p-2 text-base sm:text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-hidden focus:border-blue-500"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    bodyEditorRef.current?.focus();
                  }
                }}
              />
              <Text variant="xs" classes="text-(--text-muted) text-right">
                {title.length}/{MAX_TITLE}
              </Text>
            </div>

            {/* Poll builder */}
            {threadType === "poll" && (
              <Border classes="p-3 border-blue-800">
                <Text variant="h6" classes="mb-3">
                  Poll Setup
                </Text>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Poll question…"
                    className="bg-(--bg-secondary) border border-(--border-primary) rounded-sm p-2 text-base sm:text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-hidden focus:border-blue-500"
                  />
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handlePollOptionChange(idx, e.target.value)
                        }
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-(--bg-secondary) border border-(--border-primary) rounded-sm p-2 text-base sm:text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-hidden focus:border-blue-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="text-(--accent-error) hover:text-(--accent-error) text-sm px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < MAX_POLL_OPTIONS && (
                    <Button
                      variant="secondaryOutline"
                      size="xs"
                      onClick={handleAddPollOption}
                    >
                      + Add option
                    </Button>
                  )}
                  {/* Poll behaviour settings */}
                  <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-(--border-primary)">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={pollAllowResultsPreview}
                        onChange={(e) =>
                          setPollAllowResultsPreview(e.target.checked)
                        }
                        className="accent-blue-500"
                      />
                      Allow users to view results before voting
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={pollAllowVoteChange}
                        onChange={(e) =>
                          setPollAllowVoteChange(e.target.checked)
                        }
                        className="accent-blue-500"
                      />
                      Allow users to change their vote
                    </label>
                  </div>
                </div>
              </Border>
            )}

            {/* Cover image */}
            <label className="flex flex-col gap-1 text-start">
              <span className="text-sm font-medium">
                Cover image URL{" "}
                <span className="font-normal text-(--text-muted)">(optional)</span>
              </span>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://…"
                className="min-h-11 rounded-sm border border-(--text-primary)/15 bg-transparent px-3 text-base sm:text-sm"
              />
              <span className="text-xs text-(--text-muted)">
                Used as the thumbnail and homepage hero image. Use a clean image
                without baked-in text.
              </span>
              {coverImageUrl.trim() && /^https?:\/\//i.test(coverImageUrl) && (
                <img
                  src={coverImageUrl.trim()}
                  alt="Cover preview"
                  className="mt-1 h-28 w-auto max-w-full self-start rounded-sm object-cover"
                />
              )}
            </label>

            {/* Body editor */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex gap-1" role="tablist">
                  {(["write", "preview"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={(tab === "preview") === showPreview}
                      onClick={() => {
                        if (tab === "preview") {
                          setPreviewDoc(bodyDocRef.current);
                        }
                        setShowPreview(tab === "preview");
                      }}
                      className={`min-h-9 rounded-sm px-3 text-sm font-medium capitalize ${
                        (tab === "preview") === showPreview
                          ? "bg-(--text-primary)/10 text-(--text-primary)"
                          : "text-(--text-muted) hover:text-(--text-primary)"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {!showPreview && THREAD_TEMPLATES[selectedForumId] && (
                  <button
                    type="button"
                    onClick={() => {
                      const tpl = THREAD_TEMPLATES[selectedForumId];
                      bodyDocRef.current = tpl.doc;
                      bodyEditorRef.current?.setContent(tpl.doc);
                      saveDraftSnapshot({ doc: tpl.doc });
                    }}
                    className="min-h-9 text-sm text-(--accent-primary) underline underline-offset-2 hover:text-(--accent-primary)"
                  >
                    Insert {THREAD_TEMPLATES[selectedForumId].label}
                  </button>
                )}
              </div>
              {showPreview && (
                <div className="min-h-70 rounded-lg border border-(--text-primary)/15 p-4 text-start">
                  {title.trim() && (
                    <Text variant="h5" classes="mb-3">
                      {title.trim()}
                    </Text>
                  )}
                  {coverImageUrl.trim() && (
                    <img
                      src={coverImageUrl.trim()}
                      alt=""
                      className="mb-3 max-h-64 w-full rounded-sm object-cover"
                    />
                  )}
                  {previewDoc && previewDoc.content?.length ? (
                    <RichTextRenderer document={previewDoc} />
                  ) : (
                    <Text variant="secondary">Nothing to preview yet.</Text>
                  )}
                </div>
              )}
              <div className={showPreview ? "hidden" : undefined}>
                <ForumEditor
                  ref={bodyEditorRef}
                  placeholder="Write the opening post…"
                  editorMinHeight="280px"
                  initialDoc={threadDraft?.doc ?? undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    clearThreadDraft();
                    navigate(-1);
                  }}
                  onDocChange={(doc) => {
                    bodyDocRef.current = doc;
                    saveDraftSnapshot({ doc });
                  }}
                  submitLabel="Post Thread"
                  isSubmitting={isSubmitting}
                  submitDisabled={!title.trim() || !selectedForumId}
                />
              </div>
            </div>

            {error && (
              <Text variant="danger" classes="text-sm">
                {error}
              </Text>
            )}
          </ForumBorder>

          <aside className="hidden h-fit lg:block">
            <ForumBorder classes="p-4 text-start">
              <Text variant="h6" classes="mb-2">
                Posting tips
              </Text>
              <ul className="list-disc space-y-2 pl-4 text-sm text-(--text-secondary)">
                {POSTING_GUIDELINES.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </ForumBorder>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
};
