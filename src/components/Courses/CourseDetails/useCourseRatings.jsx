import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "../../../context/ApiContext";
import { RATINGS_DEFAULT_LIMIT } from "./courseRatingsTypes.js";

/**
 * Loads paginated ratings for a live/video course.
 * - `summary` is for the whole course and is stored once per load of page 1.
 * - Page 1 replaces items; later pages append.
 * - Ignores stale responses (course id/type change, or a newer page-1 reload).
 *
 * @param {import("./courseRatingsTypes.js").CourseRatingsType} type
 * @param {string|number} idOrSlug  Whatever the page route uses (id or slug).
 * @param {{ limit?: number }} [options]
 */
export function useCourseRatings(type, idOrSlug, { limit = RATINGS_DEFAULT_LIMIT } = {}) {
  const { getCourseRatings } = useApi();

  /** @type {[import("./courseRatingsTypes.js").RatingsSummary|null, Function]} */
  const [summary, setSummary] = useState(null);
  /** @type {[import("./courseRatingsTypes.js").RatingItem[], Function]} */
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  // Start in loading state so the empty state doesn't flash before the first fetch.
  const [isLoading, setIsLoading] = useState(!!idOrSlug);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // { status, message, isLoadMore } | null
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const requestIdRef = useRef(0);
  const inFlightRef = useRef(null); // "first" | "more" | null
  const pageRef = useRef(0);
  const getRatingsRef = useRef(getCourseRatings);
  getRatingsRef.current = getCourseRatings;

  const fetchPage = useCallback(
    async (page) => {
      if (!idOrSlug) return;
      const isFirst = page === 1;

      // Double-request guards: a page-1 load supersedes a pending load-more,
      // but nothing else runs while a request is in flight.
      if (inFlightRef.current === "first") return;
      if (!isFirst && inFlightRef.current) return;

      const requestId = ++requestIdRef.current;
      inFlightRef.current = isFirst ? "first" : "more";
      setError(null);
      if (isFirst) {
        setIsLoading(true);
        setIsLoadingMore(false);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await getRatingsRef.current(type, idOrSlug, { page, limit });
        if (requestId !== requestIdRef.current) return;

        pageRef.current = res.pagination.current_page || page;
        setHasMore(!!res.pagination.has_more);
        setNotFound(false);
        if (isFirst) {
          setSummary(res.summary);
          setItems(res.items);
        } else {
          setItems((prev) => {
            const seen = new Set(prev.map((r) => r?.id).filter((x) => x !== undefined));
            return [...prev, ...res.items.filter((r) => r?.id === undefined || !seen.has(r.id))];
          });
        }
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        if (e?.status === 404 && isFirst) {
          setNotFound(true);
        } else {
          // Failing to load more keeps already-loaded items untouched.
          setError({ status: e?.status ?? 0, message: e?.message || "", isLoadMore: !isFirst });
        }
      } finally {
        if (requestId === requestIdRef.current) {
          inFlightRef.current = null;
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [type, idOrSlug, limit]
  );

  const loadFirstPage = useCallback(() => fetchPage(1), [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    return fetchPage(pageRef.current + 1);
  }, [fetchPage, hasMore]);

  // Reset + load whenever the course (or type) changes. Bumping the request id
  // makes any in-flight response for the previous course stale.
  useEffect(() => {
    requestIdRef.current += 1;
    inFlightRef.current = null;
    pageRef.current = 0;
    setSummary(null);
    setItems([]);
    setHasMore(false);
    setError(null);
    setNotFound(false);
    setIsLoadingMore(false);
    if (idOrSlug) fetchPage(1);
    else setIsLoading(false);
  }, [fetchPage, idOrSlug]);

  return {
    summary,
    items,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    notFound,
    loadFirstPage,
    loadMore,
  };
}
