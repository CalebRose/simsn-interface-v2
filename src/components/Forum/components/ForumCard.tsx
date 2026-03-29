import React from "react";
import { useNavigate } from "react-router-dom";
import { Forum } from "../../../models/forumModels";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import routes from "../../../_constants/routes";

interface ForumCardProps {
  forum: Forum;
  subforums?: Forum[];
}

function formatTimestamp(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "—";
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const ForumCard: React.FC<ForumCardProps> = ({
  forum,
  subforums = [],
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`${routes.FORUMS}/${forum.slug}`);
  };

  return (
    <Border classes="p-4 cursor-pointer hover:opacity-90 transition-opacity flex flex-col h-full">
      {/* Top: name + description (clickable) */}
      <div
        className="flex flex-col flex-1 min-w-0"
        onClick={handleNavigate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
      >
        <div className="flex items-center gap-2 mb-1">
          <Text variant="h6">{forum.name}</Text>
          {forum.isLocked && (
            <span className="text-xs bg-yellow-600 text-white px-1 rounded">
              Locked
            </span>
          )}
        </div>
        {forum.description && (
          <Text variant="small" classes="text-gray-400 mb-2">
            {forum.description}
          </Text>
        )}
        {/* Subforums */}
        {subforums.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {subforums.map((sf) => (
              <button
                key={sf.id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${routes.FORUMS}/${forum.slug}/${sf.slug}`);
                }}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-blue-300 hover:text-blue-200 px-2 py-0.5 rounded transition-colors"
              >
                {sf.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: stats row */}
      <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-700 text-sm">
        <div className="flex gap-4">
          <span className="text-gray-400">
            <span className="text-white font-medium">{forum.threadCount}</span>{" "}
            threads
          </span>
          <span className="text-gray-400">
            <span className="text-white font-medium">{forum.postCount}</span>{" "}
            posts
          </span>
        </div>
        {forum.latestActivityAt ? (
          <div className="text-right">
            <Text variant="xs" classes="text-gray-400">
              {formatTimestamp(
                forum.latestActivityAt as unknown as { seconds: number },
              )}
            </Text>
            {forum.latestActivityBy && (
              <Text variant="xs" classes="text-gray-500">
                by {forum.latestActivityBy.username}
              </Text>
            )}
          </div>
        ) : (
          <Text variant="xs" classes="text-gray-600">
            No activity
          </Text>
        )}
      </div>
    </Border>
  );
};
