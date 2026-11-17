/**
 * Types + response normalizer for the paginated course ratings endpoint:
 *   GET /api/{live_course|video_course}/{idOrSlug}/ratings?page=&limit=
 *
 * The project is plain JS, so types are expressed as JSDoc typedefs.
 */

/** @typedef {"live_course" | "video_course"} CourseRatingsType */

/**
 * @typedef {Object} RatingClient
 * @property {number} id        0 means an admin manual rating (no real user/profile).
 * @property {string} [name]
 * @property {string | null} [image]
 */

/**
 * Same shape as the old RatingResource returned inside the course `show` response.
 * @typedef {Object} RatingItem
 * @property {number} id
 * @property {number} rate_number
 * @property {string | null} rate_comment
 * @property {RatingClient | null} client
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} RatingDistributionRow
 * @property {1|2|3|4|5} stars
 * @property {number} count
 * @property {number} percentage  0–100, used directly as the bar width.
 */

/**
 * Summary for the whole course (not per page).
 * @typedef {Object} RatingsSummary
 * @property {number} average
 * @property {number} total
 * @property {RatingDistributionRow[]} distribution  Always 5 rows, ordered 5 → 1.
 */

/**
 * @typedef {Object} RatingsPagination
 * @property {number} current_page
 * @property {number} per_page
 * @property {number} total
 * @property {number} last_page
 * @property {boolean} has_more
 */

/**
 * @typedef {Object} CourseRatingsResponse
 * @property {RatingsSummary} summary
 * @property {RatingItem[]} items
 * @property {RatingsPagination} pagination
 */

export const RATINGS_DEFAULT_LIMIT = 10;
export const RATINGS_MAX_LIMIT = 50;

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const clampPercentage = (value) => Math.min(100, Math.max(0, toNumber(value)));

/**
 * Accepts the distribution either as an array of rows
 * (`[{ stars, count, percentage }]`) or as an object keyed by star
 * (`{ "5": { count, percentage } }` or `{ "5": count }`).
 * @returns {RatingDistributionRow[]}
 */
const normalizeDistribution = (raw, total) => {
  const byStar = {};

  if (Array.isArray(raw)) {
    raw.forEach((row) => {
      const star = toNumber(row?.stars ?? row?.star ?? row?.rate ?? row?.rating, NaN);
      if (star >= 1 && star <= 5) byStar[star] = row;
    });
  } else if (raw && typeof raw === "object") {
    Object.entries(raw).forEach(([key, row]) => {
      const star = toNumber(key, NaN);
      if (star >= 1 && star <= 5) {
        byStar[star] = typeof row === "object" && row !== null ? row : { count: row };
      }
    });
  }

  return [5, 4, 3, 2, 1].map((stars) => {
    const row = byStar[stars] || {};
    const count = toNumber(row.count);
    const percentage =
      row.percentage !== undefined && row.percentage !== null
        ? clampPercentage(row.percentage)
        : total > 0
          ? clampPercentage((count / total) * 100)
          : 0;
    return { stars, count, percentage };
  });
};

/**
 * Normalizes the API payload into a stable shape for the UI.
 * @returns {CourseRatingsResponse}
 */
export const normalizeCourseRatingsResponse = (response) => {
  const payload =
    response?.data && !Array.isArray(response.data) ? response.data : response || {};

  const rawSummary = payload.summary || {};
  const rawPagination =
    payload.pagination || payload.meta || response?.pagination || response?.meta || {};

  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.ratings)
      ? payload.ratings
      : Array.isArray(payload.data)
        ? payload.data
        : [];

  const total = toNumber(
    rawSummary.total ??
      rawSummary.total_ratings ??
      rawSummary.ratings_count ??
      rawSummary.count ??
      rawPagination.total
  );

  const summary = {
    average: toNumber(
      rawSummary.average ?? rawSummary.average_rating ?? rawSummary.avg_rating ?? rawSummary.avg
    ),
    total,
    distribution: normalizeDistribution(
      rawSummary.distribution ?? payload.distribution,
      total
    ),
  };

  const currentPage = toNumber(rawPagination.current_page ?? rawPagination.page, 1);
  const lastPage = toNumber(rawPagination.last_page ?? rawPagination.total_pages, currentPage);
  const hasMore =
    typeof rawPagination.has_more === "boolean"
      ? rawPagination.has_more
      : currentPage < lastPage;

  return {
    summary,
    items,
    pagination: {
      current_page: currentPage,
      per_page: toNumber(rawPagination.per_page ?? rawPagination.limit, items.length),
      total: toNumber(rawPagination.total, total),
      last_page: lastPage,
      has_more: hasMore,
    },
  };
};
