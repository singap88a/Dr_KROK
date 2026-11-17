import React, { useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LeaveReview from "../LeaveReview";
import LoadingSpinner from "../../Common/LoadingSpinner";
import RatingStars from "../../Common/RatingStars";
import { useUser } from "../../../context/UserContext";
import { useCourseRatings } from "./useCourseRatings";

const DEFAULT_AVATAR = "/user.png";

const formatReviewDate = (value, language) => {
  if (!value) return "";
  const date = new Date(typeof value === "string" ? value.replace(" ", "T") : value);
  if (isNaN(date.getTime())) return "";
  const lng = (language || "en").split("-")[0];
  try {
    return date.toLocaleDateString(lng === "ua" ? "uk" : lng, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date.toLocaleDateString();
  }
};

function ReviewsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="p-4 border rounded-lg border-border bg-surface space-y-3">
        <LoadingSpinner variant="skeleton" className="h-5 w-40" />
        {[0, 1, 2, 3, 4].map((i) => (
          <LoadingSpinner key={i} variant="skeleton" className="h-3 w-full" />
        ))}
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="p-4 border rounded-lg border-border bg-surface space-y-3">
          <div className="flex items-center gap-3">
            <LoadingSpinner variant="skeleton" className="w-10 h-10 !rounded-full" />
            <LoadingSpinner variant="skeleton" className="h-4 w-32" />
          </div>
          <LoadingSpinner variant="skeleton" className="h-3 w-24" />
          <LoadingSpinner variant="skeleton" className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

function InlineSpinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
      aria-hidden
    />
  );
}

export default function CourseReviewsSection({
  courseId,
  idOrSlug,
  renderStaticStars,
  t,
  type = "video_course",
}) {
  const { i18n } = useTranslation();
  const { userData, isLoggedIn } = useUser();
  const [justReviewed, setJustReviewed] = useState(false);

  const {
    summary,
    items,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    notFound,
    loadFirstPage,
    loadMore,
  } = useCourseRatings(type, idOrSlug);

  // Only the loaded pages are known here; the backend still rejects duplicates.
  const userHasReviewed = useMemo(() => {
    if (justReviewed) return true;
    if (!isLoggedIn || !userData?.id) return false;
    return items.some((r) => r?.client?.id && r.client.id === userData.id);
  }, [justReviewed, isLoggedIn, userData, items]);

  const handleReviewSubmitted = (newReview) => {
    if (newReview && newReview.id) {
      setJustReviewed(true);
      // Reload page 1 so summary/distribution include the new review.
      loadFirstPage();
    }
  };

  const total = summary?.total ?? 0;
  const average = summary?.average ?? 0;
  const firstLoadFailed = !!error && !error.isLoadMore;

  // 404: course not found / inactive -> keep page alive, show a small note only.
  if (notFound) {
    return (
      <div className="lg:col-span-2">
        <p className="text-sm text-text-muted">
          {t("courses.reviewsUnavailable", "Reviews are not available for this course.")}
        </p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      {/* Leave Review Component */}
      <div className="mb-8">
        <LeaveReview
          courseId={courseId}
          onReviewSubmitted={handleReviewSubmitted}
          userHasReviewed={userHasReviewed}
          type={type}
        />
      </div>

      {/* Display Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold sm:text-xl">
          {t("courses.reviews") || "Reviews"}
          {summary ? ` (${total})` : ""}
        </h3>

        {isLoading && !summary && <ReviewsSkeleton />}

        {firstLoadFailed && (
          <div className="flex flex-wrap items-center gap-3 p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <p className="flex-1 text-sm text-red-600 dark:text-red-400">
              {t("courses.reviewsLoadError", "Couldn't load reviews. Please try again.")}
            </p>
            <button
              type="button"
              className="px-4 py-2 text-sm text-white rounded-lg bg-primary hover:bg-secondary disabled:opacity-60"
              onClick={loadFirstPage}
              disabled={isLoading}
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        )}

        {/* Average + Rating Distribution */}
        {summary && total > 0 && (
          <div className="p-4 mb-6 border rounded-lg border-border bg-surface">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold">{average.toFixed(1)}</span>
              <div>
                <RatingStars value={average} size={16} />
                <p className="text-xs text-text-muted">
                  {t("courses.basedOnReviews", {
                    count: total,
                    defaultValue: "Based on {{count}} reviews",
                  })}
                </p>
              </div>
            </div>
            <h4 className="mb-4 text-base font-semibold">
              {t("courses.ratingDistribution", "Rating Distribution")}
            </h4>
            <div className="space-y-2">
              {summary.distribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm">
                      {Array.from({ length: stars }).map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" size={14} />
                      ))}
                    </div>
                    <div className="flex-1 h-3 overflow-hidden bg-gray-200 rounded-full">
                      <div
                        className="h-full transition-all duration-300 bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-muted w-20 text-end">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="text-xs text-center text-text-muted ms-1">
                    {stars}{" "}
                    {stars === 1 ? t("courses.star", "Star") : t("courses.stars", "Stars")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {summary && total === 0 && items.length === 0 && (
          <p className="text-text-muted">
            {t("courses.noReviewsYet", "No reviews yet, be the first to rate this course")}
          </p>
        )}

        {items.map((review, index) => {
          // client may be null; client.id === 0 is an admin manual rating (no profile).
          const client = review?.client || null;
          const avatar =
            client?.image || client?.imageprofile || client?.avatar || DEFAULT_AVATAR;
          const name = client?.name || t("courses.anonymous", "Anonymous");
          const date = formatReviewDate(review?.created_at, i18n?.language);
          return (
            <div
              key={review?.id ?? index}
              className="p-4 border rounded-lg shadow-sm border-border bg-surface"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={avatar}
                  alt={name}
                  className="object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith(DEFAULT_AVATAR)) {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }
                  }}
                />
                <div>
                  <p className="text-sm font-semibold sm:text-base">{name}</p>
                  {date && <p className="text-xs text-text-muted">{date}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2 text-yellow-400">
                {renderStaticStars(Number(review?.rate_number) || 0)}
              </div>
              {review?.rate_comment && (
                <p className="text-sm text-text-secondary sm:text-base">
                  {review.rate_comment}
                </p>
              )}
            </div>
          );
        })}

        {/* Load-more error: keeps already-loaded items */}
        {error?.isLoadMore && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {t("courses.loadMoreReviewsError", "Couldn't load more reviews.")}
          </p>
        )}

        {hasMore && !firstLoadFailed && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-sm text-white rounded-lg bg-primary hover:bg-secondary disabled:opacity-60"
            onClick={loadMore}
            disabled={isLoadingMore || isLoading}
          >
            {isLoadingMore && <InlineSpinner />}
            {error?.isLoadMore
              ? t("common.retry", "Retry")
              : t("courses.loadMoreReviews", "Load more reviews")}
          </button>
        )}
      </div>
    </div>
  );
}
