import React from "react";
import { FaStar } from "react-icons/fa";
import LeaveReview from "../LeaveReview";

export default function CourseReviewsSection({
  courseId,
  handleReviewSubmitted,
  userHasReviewed,
  reviews,
  showAll,
  setShowAll,
  renderStaticStars,
  t,
}) {
  return (
    <div className="lg:col-span-2">
      {/* Leave Review Component */}
      <div className="mb-8">
        <LeaveReview
          courseId={courseId}
          onReviewSubmitted={handleReviewSubmitted}
          userHasReviewed={userHasReviewed}
        />
      </div>

      {/* Display Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold sm:text-xl">
          {t("courses.reviews") || "Reviews"} ({reviews.length})
        </h3>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="p-4 mb-6 border rounded-lg border-border bg-surface">
            <h4 className="mb-4 text-base font-semibold">
              {t("courses.ratingDistribution", "Rating Distribution")}
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = reviews.filter(
                  (r) => Math.round(r.rate_number) === starCount
                ).length;
                const percentage =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={starCount} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        {Array.from({ length: starCount }).map((_, i) => (
                          <FaStar key={i} className="text-yellow-400" size={14} />
                        ))}
                      </div>
                      <div className="flex-1 h-3 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          className="h-full transition-all duration-300 bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-text-muted w-14 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="text-xs text-center text-text-muted ml-1">
                      {starCount}{" "}
                      {starCount === 1
                        ? t("courses.star", "Star")
                        : t("courses.stars", "Stars")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <p className="text-text-muted">
            {t("courses.noReviews") || "No reviews yet."}
          </p>
        )}
        {(showAll ? reviews : reviews.slice(0, 3)).map((review, index) => (
          <div
            key={review.id || index}
            className="p-4 border rounded-lg shadow-sm border-border bg-surface"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  review.client?.imageprofile ||
                  review.client?.avatar ||
                  "/user.png"
                }
                alt={review.client?.name || "User"}
                className="object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10"
                onError={(e) => {
                  e.currentTarget.src = "/user.png";
                }}
              />
              <div>
                <p className="text-sm font-semibold sm:text-base">
                  {review.client?.name || "Anonymous"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2 text-yellow-400">
              {renderStaticStars(review.rate_number)}
            </div>
            <p className="text-sm text-text-secondary sm:text-base">
              {review.rate_comment}
            </p>
          </div>
        ))}
        {reviews.length > 3 && (
          <button
            className="px-4 py-2 mt-2 text-sm text-white rounded-lg bg-primary hover:bg-secondary"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? t("courses.showLess") || "Show Less"
              : t("courses.showMore") || "Show More"}
          </button>
        )}
      </div>
    </div>
  );
}
