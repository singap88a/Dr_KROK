import React from "react";
import { useTranslation } from "react-i18next";
import { FaGraduationCap, FaVideo, FaBroadcastTower } from "react-icons/fa";

export default function CoursesFilterBar({
  filterType,
  handleTypeChange,
  filterStatus,
  handleStatusChange,
  summary,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-sm">
      {/* Type Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: t("myCourses.filterAll", "All Courses"), icon: FaGraduationCap },
          { id: "video", label: t("myCourses.filterVideo", "Video Courses"), icon: FaVideo },
          { id: "live", label: t("myCourses.filterLive", "Live Courses"), icon: FaBroadcastTower },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTypeChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? tab.id === "live"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-background text-text-secondary hover:text-text border border-border/80"
              }`}
            >
              <Icon className="text-xs" />
              <span>{tab.label}</span>
              {summary && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    active ? "bg-white/20 text-white" : "bg-border text-text-secondary"
                  }`}
                >
                  {tab.id === "all"
                    ? summary.total_enrolled_courses || 0
                    : tab.id === "video"
                    ? summary.video_courses_count || 0
                    : summary.live_courses_count || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status Filter (All / Active / Expired) */}
      <div className="flex items-center gap-1.5 self-start md:self-auto bg-background p-1 rounded-xl border border-border/80 text-xs">
        {[
          { id: "all", label: t("myCourses.filterAll", "All") },
          { id: "active", label: t("myCourses.filterActive", "Active") },
          { id: "expired", label: t("myCourses.filterExpired", "Expired") },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => handleStatusChange(st.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === st.id
                ? "bg-surface text-primary shadow-sm font-bold"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>
    </div>
  );
}
