import React, { useState } from "react";
import { Poll, PollVote } from "../../../models/forumModels";
import { ForumBorder } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { Button } from "../../../_design/Buttons";

interface PollBlockProps {
  poll: Poll;
  userVote: PollVote | null;
  canVote: boolean;
  onVote: (pollId: string, selectedOptionIds: string[]) => Promise<void>;
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
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasVoted = !!userVote;
  const showResults = hasVoted || poll.isClosed;

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
      await onVote(poll.id, Array.from(selected));
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

  return (
    <ForumBorder classes="p-3">
      <Text variant="h6" classes="mb-3">
        📊 {poll.question}
      </Text>

      <div className="flex flex-col gap-2">
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

        {!showResults && canVote && (
          <div className="flex items-center gap-2">
            {error && (
              <Text variant="danger" classes="text-xs">
                {error}
              </Text>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={selected.size === 0 || isVoting}
            >
              {isVoting ? "Voting…" : "Vote"}
            </Button>
          </div>
        )}
      </div>
    </ForumBorder>
  );
};
