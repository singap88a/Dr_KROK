import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaChevronRight,
  FaCoins,
  FaTrophy,
  FaMedal,
  FaStar,
} from "react-icons/fa";

// Mini course progress card used inside Dashboard (not MyCourses)
function DashboardCourseCard({ course, navigate, t }) {
  const live = course.course_type === "live" || course.type === "live_course";
  const courseId = course.course_id || course.id;
  const progressPct = Math.min(100, Math.max(0, Number(course.progress?.percentage || 0)));
  const rank = course.rank || {};
  const points = course.points || {};

  return (
    <div
      onClick={() => {
        if (live) {
          navigate(`/live-courses/${courseId}/lessons`);
        } else {
          navigate(`/courses/${courseId}/lessons`);
        }
      }}
      className="p-4 rounded-2xl bg-background/60 hover:bg-background border border-border/70 hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group shadow-sm"
    >
      <div className="flex items-start gap-3">
        <img
          src={course.image || "/course-placeholder.jpg"}
          alt={course.title}
          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
          onError={(e) => {
            e.currentTarget.src = "/course-placeholder.jpg";
          }}
        />

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                live
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {live ? t("courses.liveCourse", "Live") : t("courses.videoCourse", "Video")}
            </span>
            {course.category && (
              <span className="text-[10px] text-text-secondary truncate">
                {course.category}
              </span>
            )}
          </div>

          <h4 className="font-bold text-sm text-text line-clamp-1 group-hover:text-primary transition-colors">
            {course.title || course.name}
          </h4>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary font-medium">
            {t("myCourses.progress", "Progress")}:{" "}
            <strong className="text-text font-bold">
              {course.progress?.completed_lessons || 0} / {course.progress?.total_lessons || 0}
            </strong>
          </span>
          <span className="font-black text-primary">{progressPct}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-border/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPct >= 100
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-primary to-blue-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Rank & Points Row */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
        <div className="flex items-center gap-1.5">
          {rank.is_first ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold text-[11px]">
              🏆 {rank.rank_label || "1 / 1"}
            </span>
          ) : rank.is_top_three ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
              🥇 {rank.rank_label}
            </span>
          ) : (
            <span className="text-text-secondary text-[11px]">
              {t("myCourses.rankInCourse", "Rank")}:{" "}
              <strong className="text-text">
                {rank.rank_label || `${rank.current_rank || 1} / ${rank.total_students || 1}`}
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-text">
          <FaCoins className="text-yellow-500 text-xs" />
          <span>{points.points_label || `${points.earned_points || 0} pts`}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCourseProgress({ coursesProgressList, setActiveTab }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!coursesProgressList || coursesProgressList.length === 0) return null;

  return (
    <div className="rounded-3xl bg-surface border border-border/70 p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FaChartBar className="text-lg" />
            </div>
            <h2 className="text-xl font-bold text-text">
              {t("myCourses.dashboardProgressTitle", "My Learning Progress & Ranking")}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            {t(
              "myCourses.dashboardProgressSubtitle",
              "Track your completion, points, and class ranking across enrolled courses"
            )}
          </p>
        </div>

        <button
          onClick={() => setActiveTab("courses")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-secondary transition-all shadow-sm self-start sm:self-auto"
        >
          <span>{t("myCourses.viewAllCourses", "View All Courses")}</span>
          <FaChevronRight className="text-[10px]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coursesProgressList.slice(0, 4).map((course, idx) => (
          <DashboardCourseCard
            key={course.course_id || course.id || idx}
            course={course}
            navigate={navigate}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
