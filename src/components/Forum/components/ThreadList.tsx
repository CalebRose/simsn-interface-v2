import React from "react";
import { Thread } from "../../../models/forumModels";
import { ThreadListItem } from "./ThreadListItem";
import { Text } from "../../../_design/Typography";
import { LoadSpinner } from "../../../_design/LoadSpinner";
import { Button } from "../../../_design/Buttons";

interface ThreadListProps {
  threads: Thread[];
  pinnedThreads: Thread[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  pinnedThreads,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
  if (isLoading && threads.length === 0 && pinnedThreads.length === 0) {
    return <LoadSpinner />;
  }

  const allEmpty = threads.length === 0 && pinnedThreads.length === 0;

  if (!isLoading && allEmpty) {
    return (
      <div className="py-10 text-center">
        <Text variant="secondary">No threads yet. Be the first to post!</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {pinnedThreads.length > 0 && (
        <>
          {pinnedThreads.map((t) => (
            <ThreadListItem key={t.id} thread={t} />
          ))}
          {threads.length > 0 && (
            <div className="border-t border-gray-700 my-1" />
          )}
        </>
      )}

      {threads.map((t) => (
        <ThreadListItem key={t.id} thread={t} />
      ))}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
};
