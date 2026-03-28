import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { QuestionFilters, QuestionSortKey, UseQuestionFiltersResult } from "@/dataHelper/chatbot.dataHelper";
import {
  DEFAULT_SORT_KEY,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_PAGINATION,
  DEFAULT_PAGE,
  SEARCH_DEBOUNCE_DELAY_MS,
} from "@/constant";
import { parseDirection, parseNumber } from "@/utils/HelperUtils";

const SORT_KEY_VALUES: QuestionSortKey[] = ["id", "content", "total_answers"];

// Parse sort key from string
const parseSortKey = (value: string | null): QuestionSortKey | null => {
  if (!value) return DEFAULT_SORT_KEY;
  return SORT_KEY_VALUES.includes(value as QuestionSortKey) ? (value as QuestionSortKey) : null;
};

// Custom hook to manage question filters with URL synchronization
export const useQuestionFilters = (): UseQuestionFiltersResult => {
  const [searchParams, setSearchParams] = useSearchParams();

  const resolvedInitial = useMemo<QuestionFilters>(() => {
    const sortKey = parseSortKey(searchParams.get("sort_by"));

    return {
      content: searchParams.get("content") ?? "",
      page: parseNumber(searchParams.get("page"), DEFAULT_PAGE),
      per_page: parseNumber(searchParams.get("per_page"), DEFAULT_PAGINATION),
      sort_by: sortKey,
      direction: sortKey ? parseDirection(searchParams.get("direction")) : DEFAULT_SORT_DIRECTION,
    } satisfies QuestionFilters;
  }, [searchParams]);

  const [searchValue, setSearchValue] = useState(resolvedInitial.content);
  const [content, setContent] = useState(resolvedInitial.content);
  const [page, setPage] = useState(resolvedInitial.page);
  const [perPage, setPerPageState] = useState(resolvedInitial.per_page);
  const [sortBy, setSortBy] = useState<QuestionSortKey | null>(resolvedInitial.sort_by);
  const [direction, setDirection] = useState<"asc" | "desc">(
    resolvedInitial.sort_by ? resolvedInitial.direction : DEFAULT_SORT_DIRECTION,
  );
  const skipUrlSyncRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      skipUrlSyncRef.current = true;
      setContent((prev) => {
        if (prev === searchValue) return prev;
        setPage((current) => (current === DEFAULT_PAGE ? current : DEFAULT_PAGE));
        return searchValue;
      });
    }, SEARCH_DEBOUNCE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  // Toggle sort order or set new sort key
  const toggleSort = (key: QuestionSortKey) => {
    setPage(DEFAULT_PAGE);

    if (sortBy === key) {
      if (direction === "asc") {
        setDirection("desc");
      } else if (direction === "desc") {
        setSortBy(null);
        setDirection(DEFAULT_SORT_DIRECTION);
      }
    } else {
      setSortBy(key);
      setDirection(DEFAULT_SORT_DIRECTION);
    }
  };

  // Reset all filters to default values
  const reset = () => {
    setSearchValue("");
    setContent("");
    setPage(DEFAULT_PAGE);
    setPerPageState(DEFAULT_PAGINATION);
    setSortBy(DEFAULT_SORT_KEY);
    setDirection(DEFAULT_SORT_DIRECTION);
    setSearchParams({});
  };

  useEffect(() => {
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }
    setSearchValue(resolvedInitial.content);
    setContent(resolvedInitial.content);
    setPage(resolvedInitial.page);
    setPerPageState(resolvedInitial.per_page);
    setSortBy(resolvedInitial.sort_by);
    setDirection(resolvedInitial.sort_by ? resolvedInitial.direction : DEFAULT_SORT_DIRECTION);
  }, [resolvedInitial.content, resolvedInitial.direction, resolvedInitial.page, resolvedInitial.per_page, resolvedInitial.sort_by]);

  const filters: QuestionFilters = {
    content,
    page,
    per_page: perPage,
    sort_by: sortBy,
    direction,
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.content) params.set("content", filters.content);
    if (filters.page !== DEFAULT_PAGE) params.set("page", String(filters.page));
    if (filters.per_page !== DEFAULT_PAGINATION) params.set("per_page", String(filters.per_page));
    if (filters.sort_by) {
      params.set("sort_by", filters.sort_by);
      params.set("direction", filters.direction);
    }
    setSearchParams(params, { replace: true });
  }, [filters.content, filters.direction, filters.page, filters.per_page, filters.sort_by, setSearchParams]);

  const handleSetTitle = (value: string) => {
    setSearchValue(value);
  };

  return {
    filters,
    searchValue,
    setTitle: handleSetTitle,
    toggleSort,
    setPage,
    setPerPage: (value: number) => {
      setPerPageState(value);
      setPage(DEFAULT_PAGE);
    },
    reset,
  };
};
