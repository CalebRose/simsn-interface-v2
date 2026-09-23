import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { Input } from "../../_design/Inputs";
import { LoadSpinner } from "../../_design/LoadSpinner";
import { ThreadSearchResultItem } from "./components/ThreadSearchResultItem";
import { useForums } from "../../_hooks/useForumHooks";
import { useForumStore } from "../../context/ForumContext";
import { ForumService } from "../../_services/forumService";
import { Forum, Thread } from "../../models/forumModels";
import routes from "../../_constants/routes";
import type { QueryDocumentSnapshot } from "firebase/firestore";

interface AuthorOption {
  uid: string;
  username: string;
}

const AUTHOR_SEARCH_DEBOUNCE_MS = 300;

export const ForumSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { forums, forumsLoading } = useForums();
  const { permissions } = useForumStore();

  const [selectedForumId, setSelectedForumId] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorOption | null>(
    null,
  );
  const [authorSuggestions, setAuthorSuggestions] = useState<AuthorOption[]>(
    [],
  );
  const [dateAfter, setDateAfter] = useState("");
  const [dateBefore, setDateBefore] = useState("");

  const [rawThreads, setRawThreads] = useState<Thread[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeParams, setActiveParams] = useState<{
    forumIds?: string[];
    authorUid?: string;
    titlePrefix?: string;
  } | null>(null);

  const forumsById = useMemo(
    () => new Map(forums.map((f) => [f.id, f])),
    [forums],
  );

  const { standaloneForums, groupedForums } = useMemo(() => {
    const viewable = forums.filter(
      (f) => permissions.canManageForums || f.visibility !== "admin_only",
    );
    const subsByParent = new Map<string, Forum[]>();
    for (const f of viewable) {
      if (f.type === "subforum" && f.parentForumId) {
        if (!subsByParent.has(f.parentForumId))
          subsByParent.set(f.parentForumId, []);
        subsByParent.get(f.parentForumId)!.push(f);
      }
    }
    const standalone: Forum[] = [];
    const grouped: { parent: Forum; children: Forum[] }[] = [];
    for (const f of viewable) {
      if (f.type === "top_level" || !f.parentForumId) {
        const children = subsByParent.get(f.id) ?? [];
        if (children.length > 0) {
          grouped.push({ parent: f, children });
        } else {
          standalone.push(f);
        }
      }
    }
    return { standaloneForums: standalone, groupedForums: grouped };
  }, [forums, permissions.canManageForums]);

  // Debounced author-username autocomplete
  useEffect(() => {
    if (!authorQuery.trim() || selectedAuthor) {
      setAuthorSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      const results = await ForumService.SearchUsersByPrefix(
        authorQuery.trim(),
      );
      setAuthorSuggestions(results);
    }, AUTHOR_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [authorQuery, selectedAuthor]);

  const resolveForumIds = (): string[] | undefined => {
    if (!selectedForumId) return undefined;
    const group = groupedForums.find((g) => g.parent.id === selectedForumId);
    if (group) return [group.parent.id, ...group.children.map((c) => c.id)];
    return [selectedForumId];
  };

  const runSearch = useCallback(
    async (
      params: { forumIds?: string[]; authorUid?: string; titlePrefix?: string },
      cursor?: QueryDocumentSnapshot,
    ) => {
      setIsLoading(true);
      try {
        const { threads, lastDoc: nextLastDoc } =
          await ForumService.SearchThreads(params, cursor);
        setRawThreads((prev) => (cursor ? [...prev, ...threads] : threads));
        setLastDoc(nextLastDoc);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleSearch = () => {
    const params = {
      forumIds: resolveForumIds(),
      authorUid: selectedAuthor?.uid,
      titlePrefix: titleInput.trim() || undefined,
    };
    setActiveParams(params);
    setHasSearched(true);
    void runSearch(params);
  };

  const handleLoadMore = () => {
    if (!activeParams || !lastDoc) return;
    void runSearch(activeParams, lastDoc);
  };

  const handleClear = () => {
    setSelectedForumId("");
    setTitleInput("");
    setAuthorQuery("");
    setSelectedAuthor(null);
    setDateAfter("");
    setDateBefore("");
    setRawThreads([]);
    setLastDoc(null);
    setActiveParams(null);
    setHasSearched(false);
  };

  // Date range is applied client-side against the fetched page, since Firestore
  // only allows one field with a range filter per query (used by title prefix).
  const filteredThreads = useMemo(() => {
    const afterMs = dateAfter ? new Date(dateAfter).getTime() : null;
    const beforeMs = dateBefore
      ? new Date(dateBefore).getTime() + 24 * 60 * 60 * 1000 - 1
      : null;
    return rawThreads.filter((t) => {
      const createdMs = t.createdAt?.toMillis?.() ?? 0;
      if (afterMs && createdMs < afterMs) return false;
      if (beforeMs && createdMs > beforeMs) return false;
      return true;
    });
  }, [rawThreads, dateAfter, dateBefore]);

  return (
    <PageContainer isLoading={forumsLoading} title="Search Forums">
      <div className="mx-auto w-full max-w-4xl px-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Forum / Subforum</label>
            <select
              value={selectedForumId}
              onChange={(e) => setSelectedForumId(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded-sm p-2 text-sm text-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="">All forums</option>
              {standaloneForums.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
              {groupedForums.map(({ parent, children }) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name} (all)</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Thread title starts with
            </label>
            <Input
              showLabel={false}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Week 5 recap"
              classes="bg-gray-900 border border-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1 relative">
            <label className="text-sm font-medium">Posted by</label>
            <Input
              showLabel={false}
              value={selectedAuthor ? selectedAuthor.username : authorQuery}
              onChange={(e) => {
                setSelectedAuthor(null);
                setAuthorQuery(e.target.value);
              }}
              placeholder="Username"
              classes="bg-gray-900 border border-gray-600"
            />
            {authorSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-gray-900 border border-gray-600 rounded-sm max-h-48 overflow-y-auto">
                {authorSuggestions.map((u) => (
                  <button
                    key={u.uid}
                    type="button"
                    className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700"
                    onClick={() => {
                      setSelectedAuthor(u);
                      setAuthorQuery("");
                      setAuthorSuggestions([]);
                    }}
                  >
                    {u.username}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Date range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateAfter}
                onChange={(e) => setDateAfter(e.target.value)}
                className="bg-gray-900 border border-gray-600 rounded-sm p-2 text-sm text-white flex-1 focus:outline-hidden focus:border-blue-500"
              />
              <Text variant="xs">to</Text>
              <input
                type="date"
                value={dateBefore}
                onChange={(e) => setDateBefore(e.target.value)}
                className="bg-gray-900 border border-gray-600 rounded-sm p-2 text-sm text-white flex-1 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="secondaryOutline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(routes.FORUMS)}
          >
            Back to Forums
          </Button>
        </div>

        {isLoading && rawThreads.length === 0 ? (
          <LoadSpinner />
        ) : hasSearched && filteredThreads.length === 0 ? (
          <div className="py-10 text-center">
            <Text variant="secondary">No threads match your search.</Text>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredThreads.map((t) => (
              <ThreadSearchResultItem
                key={t.id}
                thread={t}
                forumName={forumsById.get(t.forumId)?.name}
              />
            ))}
          </div>
        )}

        {hasSearched && lastDoc && (
          <div className="flex justify-center mt-4">
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
