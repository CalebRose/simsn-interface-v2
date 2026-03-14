import { useState, useCallback, useRef, useEffect } from "react";

// Generic paginated pool response shape
interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
  pages: number;
  players: T[];
  [key: string]: any; // age_counts, pool_counts, etc.
}

export interface PoolTableState<T> {
  data: T[];
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  sortKey: string;
  sortDir: "asc" | "desc";
  filters: Record<string, any>;
  search: string;
  isLoading: boolean;
  error: string | null;
  /** Extra metadata from the response (age_counts, pool_counts, etc.) */
  meta: Record<string, any>;
  // Actions
  setPage: (n: number) => void;
  setSort: (key: string) => void;
  setFilter: (key: string, value: any) => void;
  setSearch: (term: string) => void;
  refresh: () => void;
}

interface UsePoolTableOptions {
  defaultSort?: string;
  defaultDir?: "asc" | "desc";
  defaultPerPage?: number;
}

/**
 * Hook for managing server-side paginated, sorted, and filtered pool tables.
 * Generic over the row type T and the full response type R.
 *
 * @param fetcher - Function that takes query params and returns a paginated response.
 * @param opts - Default sort, direction, and page size.
 */
export function usePoolTable<T, R extends PaginatedResponse<T>>(
  fetcher: (params: Record<string, any>) => Promise<R>,
  opts?: UsePoolTableOptions,
): PoolTableState<T> {
  const {
    defaultSort = "lastname",
    defaultDir = "asc",
    defaultPerPage = 50,
  } = opts ?? {};

  const [data, setData] = useState<T[]>([]);
  const [page, setPageState] = useState(1);
  const [perPage] = useState(defaultPerPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultDir);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [search, setSearchState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, any>>({});

  // Debounce search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Track mount for cancellation
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);

    const params: Record<string, any> = {
      page,
      per_page: perPage,
      sort: sortKey,
      dir: sortDir,
      ...filters,
    };
    if (debouncedSearch.length >= 2) {
      params.search = debouncedSearch;
    }

    try {
      const res = await fetcher(params);
      // Only apply if this is still the latest request
      if (id !== fetchIdRef.current) return;
      setData(res.players);
      setTotalPages(res.pages);
      setTotalCount(res.total);
      // Capture extra metadata (age_counts, pool_counts, etc.)
      const { total, page: _p, per_page: _pp, pages: _pages, players: _pl, ...rest } = res;
      setMeta(rest);
    } catch (err: any) {
      if (id !== fetchIdRef.current) return;
      setError(err?.message || "Failed to load data");
      setData([]);
    }
    if (id === fetchIdRef.current) setIsLoading(false);
  }, [fetcher, page, perPage, sortKey, sortDir, filters, debouncedSearch]);

  // Fetch on param change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounce search input
  const setSearch = useCallback((term: string) => {
    setSearchState(term);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(term);
      setPageState(1);
    }, 300);
  }, []);

  const setPage = useCallback((n: number) => {
    setPageState(n);
  }, []);

  const setSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortDir("desc");
      }
      return key;
    });
    setPageState(1);
  }, []);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => {
      if (value === undefined || value === null || value === "") {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setPageState(1);
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    page,
    perPage,
    totalPages,
    totalCount,
    sortKey,
    sortDir,
    filters,
    search,
    isLoading,
    error,
    meta,
    setPage,
    setSort,
    setFilter,
    setSearch,
    refresh,
  };
}
