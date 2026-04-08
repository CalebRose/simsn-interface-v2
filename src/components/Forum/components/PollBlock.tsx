import React, { useState } from "react";
import { Poll, PollVote } from "../../../models/forumModels";
import { ForumService } from "../../../_services/forumService";
import { ForumBorder } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { Button } from "../../../_design/Buttons";

interface PollBlockProps {
  poll: Poll;
  userVote: PollVote | null;
  canVote: boolean;
  onVote: (pollId: string, selectedOptionIds: string[]) => Promise<void>;
  onChangeVote?: (pollId: string, selectedOptionIds: string[]) => Promise<void>;
  canManagePoll?: boolean;
  onTogglePoll?: (pollId: string, close: boolean) => Promise<void>;
  isOP?: boolean;
  onUpdatePollSettings?: (
    pollId: string,
    updates: { allowResultsPreview?: boolean; allowVoteChange?: boolean },
  ) => Promise<void>;
}

function formatCloseDate(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "";
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const PollBlock: React.FC<PollBlockProps> = ({
  poll,
  userVote,
  canVote,
  onVote,
  onChangeVote,
  canManagePoll = false,
  onTogglePoll,
  isOP = false,
  onUpdatePollSettings,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isVoting, setIsVoting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allVotes, setAllVotes] = useState<PollVote[] | null>(null);
  const [showVoters, setShowVoters] = useState(false);
  /** User clicked "View results" before voting */
  const [previewingResults, setPreviewingResults] = useState(false);
  /** User clicked "Change vote" after already voting */
  const [changingVote, setChangingVote] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const hasVoted = !!userVote;

  // Pre-populate selection with existing vote when entering change-vote mode
  const enterChangeVote = () => {
    if (userVote) {
      setSelected(new Set(userVote.selectedOptionIds));
    }
    setChangingVote(true);
    setError(null);
  };

  const cancelChangeVote = () => {
    setChangingVote(false);
    setSelected(new Set());
    setError(null);
  };

  /**
   * showResults is true when:
   * - user has already voted (and is not in change-vote mode), OR
   * - poll is closed, OR
   * - user chose to preview results (and the poll allows it)
   */
  const showResults =
    (hasVoted && !changingVote) || poll.isClosed || previewingResults;

  const handleToggle = (optionId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        if (!poll.allowsMultipleVotes) next.clear();
        if (next.size < poll.maxSelectableOptions) next.add(optionId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setIsVoting(true);
    setError(null);
    try {
      if (changingVote && onChangeVote) {
        await onChangeVote(poll.id, Array.from(selected));
        setChangingVote(false);
        setSelected(new Set());
      } else {
        await onVote(poll.id, Array.from(selected));
        setPreviewingResults(false);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit vote.");
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (voteCount: number): number => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((voteCount / poll.totalVotes) * 100);
  };

  const handleTogglePoll = async () => {
    if (!onTogglePoll) return;
    setIsToggling(true);
    try {
      await onTogglePoll(poll.id, !poll.isClosed);
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleSetting = async (
    key: "allowResultsPreview" | "allowVoteChange",
  ) => {
    if (!onUpdatePollSettings) return;
    setIsUpdatingSettings(true);
    try {
      await onUpdatePollSettings(poll.id, { [key]: !poll[key] });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const loadVoters = async () => {
    if (showVoters) {
      setShowVoters(false);
      return;
    }
    const votes = await ForumService.GetAllPollVotes(poll.id);
    setAllVotes(votes);
    setShowVoters(true);
  };

  return (
    <ForumBorder classes="p-3">
      <Text variant="h6" classes="mb-3">
        📊 {poll.question}
      </Text>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
        {poll.options.map((option) => {
          const pct = getPercentage(option.voteCount);
          const isUserChoice = userVote?.selectedOptionIds.includes(option.id);

          if (showResults) {
            return (
              <div key={option.id} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-sm">
                  <span
                    className={
                      isUserChoice ? "font-semibold text-blue-400" : ""
                    }
                  >
                    {isUserChoice ? "✓ " : ""}
                    {option.label}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""} (
                    {pct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          }

          // Voting / change-vote UI
          return (
            <label
              key={option.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                selected.has(option.id)
                  ? "border-blue-500 bg-blue-900/30"
                  : "border-gray-600 hover:border-gray-400"
              }`}
            >
              <input
                type={poll.allowsMultipleVotes ? "checkbox" : "radio"}
                name={`poll-${poll.id}`}
                checked={selected.has(option.id)}
                onChange={() => handleToggle(option.id)}
                className="accent-blue-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
        <Text variant="xs" classes="text-gray-500">
          {poll.totalVotes} total vote{poll.totalVotes !== 1 ? "s" : ""}
          {poll.closesAt && !poll.isClosed && (
            <>
              {" "}
              · Closes{" "}
              {formatCloseDate(poll.closesAt as unknown as { seconds: number })}
            </>
          )}
          {poll.isClosed && <> · Poll closed</>}
        </Text>

        <div className="flex items-center gap-2 flex-wrap">
          {error && (
            <Text variant="danger" classes="text-xs">
              {error}
            </Text>
          )}

          {/* Preview results toggle — only when user hasn't voted yet */}
          {!hasVoted && !poll.isClosed && poll.allowResultsPreview && (
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => setPreviewingResults((v) => !v)}
            >
              {previewingResults ? "Hide results" : "View results"}
            </Button>
          )}

          {/* Vote / update-vote button */}
          {!showResults && canVote && (
            <>
              {changingVote && (
                <Button
                  variant="secondaryOutline"
                  size="sm"
                  onClick={cancelChangeVote}
                  disabled={isVoting}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={selected.size === 0 || isVoting}
              >
                {isVoting
                  ? changingVote
                    ? "Updating…"
                    : "Voting…"
                  : changingVote
                    ? "Update vote"
                    : "Vote"}
              </Button>
            </>
          )}

          {/* Change vote button — shown after voting if poll allows it */}
          {hasVoted &&
            !changingVote &&
            !poll.isClosed &&
            poll.allowVoteChange &&
            canVote &&
            onChangeVote && (
              <Button
                variant="secondaryOutline"
                size="sm"
                onClick={enterChangeVote}
              >
                Change vote
              </Button>
            )}
        </div>
      </div>

      {/* OP / moderator settings panel */}
      {(isOP || canManagePoll) && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex flex-col gap-2">
          <Text
            variant="xs"
            classes="text-gray-400 font-semibold uppercase tracking-wide"
          >
            Poll settings
          </Text>
          <div className="flex flex-wrap gap-4">
            {isOP && onUpdatePollSettings && (
              <>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={poll.allowResultsPreview}
                    onChange={() => handleToggleSetting("allowResultsPreview")}
                    disabled={isUpdatingSettings}
                    className="accent-blue-500"
                  />
                  Allow results preview
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={poll.allowVoteChange}
                    onChange={() => handleToggleSetting("allowVoteChange")}
                    disabled={isUpdatingSettings}
                    className="accent-blue-500"
                  />
                  Allow vote changes
                </label>
              </>
            )}
            {canManagePoll && onTogglePoll && (
              <Button
                variant={poll.isClosed ? "primary" : "secondaryOutline"}
                size="xs"
                onClick={handleTogglePoll}
                disabled={isToggling}
              >
                {isToggling
                  ? "…"
                  : poll.isClosed
                    ? "Reopen poll"
                    : "Close poll"}
              </Button>
            )}
          </div>
        </div>
      )}
    </ForumBorder>
  );
};
