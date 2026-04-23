import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { Border, ForumBorder } from "../../_design/Borders";
import { ForumBreadcrumbs } from "./components/ForumBreadcrumbs";
import { ForumEditor } from "./components/ForumEditor";
import { useForumStore } from "../../context/ForumContext";
import { useAuthStore } from "../../context/AuthContext";
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

const MAX_TITLE = 100;
const MAX_POLL_OPTIONS = 10;

export const CreateThreadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedForumId = searchParams.get("forumId");

  const { currentUser } = useAuthStore();
  const { createThread, permissions, forums, loadForums } = useForumStore();

  const [title, setTitle] = useState("");
  const [selectedForumId, setSelectedForumId] = useState(
    preselectedForumId ?? "",
  );
  const [threadType, setThreadType] = useState<ThreadType>("standard");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollAllowResultsPreview, setPollAllowResultsPreview] = useState(false);
  const [pollAllowVoteChange, setPollAllowVoteChange] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMediaTags, setSelectedMediaTags] = useState<MediaTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const bodyEditorRef = useRef<{ focus: () => void }>(null);

  useEffect(() => {
    if (forums.length === 0) loadForums();
  }, [forums.length, loadForums]);

  useEffect(() => {
    if (preselectedForumId) setSelectedForumId(preselectedForumId);
  }, [preselectedForumId]);

  if (!permissions.canCreateThread) {
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

  const postableForums = forums.filter(
    (f) =>
      !f.isLocked && (f.visibility === "public" || f.visibility === "members"),
  );

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
        body: doc,
        bodyText: plainText,
        threadType,
        tags: selectedMediaTags.length > 0 ? selectedMediaTags : [],
        poll,
        mentions,
      };

      const threadId = await createThread(dto);
      if (threadId) {
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
      <div className="flex flex-col w-[95vw] lg:w-[80vw]">
        <ForumBreadcrumbs crumbs={crumbs} />
        <Text variant="h4" classes="mb-4">
          Create New Thread
        </Text>

        <ForumBorder classes="p-4 flex flex-col gap-4">
          {/* Forum selector */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Forum <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedForumId}
              onChange={(e) => {
                setSelectedForumId(e.target.value);
                setSelectedMediaTags([]); // reset tags when forum changes
              }}
              className="bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
                    onChange={() => setThreadType(type)}
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
                <span className="text-gray-400 font-normal">(optional)</span>
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
                          : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400"
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
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title…"
              maxLength={MAX_TITLE}
              className="bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  bodyEditorRef.current?.focus();
                }
              }}
            />
            <Text variant="xs" classes="text-gray-500 text-right">
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
                  className="bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
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
                      className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(idx)}
                        className="text-red-400 hover:text-red-300 text-sm px-1"
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
                <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-gray-700">
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
                      onChange={(e) => setPollAllowVoteChange(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Allow users to change their vote
                  </label>
                </div>
              </div>
            </Border>
          )}

          {/* Body editor */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Body</span>
            <ForumEditor
              ref={bodyEditorRef}
              placeholder="Write the opening post…"
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              submitLabel="Post Thread"
              isSubmitting={isSubmitting}
            />
          </div>

          {error && (
            <Text variant="danger" classes="text-sm">
              {error}
            </Text>
          )}
        </ForumBorder>
      </div>
    </PageContainer>
  );
};
