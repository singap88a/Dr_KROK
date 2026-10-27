import React from "react";
import { FaCalendarAlt, FaFire } from "react-icons/fa";

export default function TrackerCalendarGrid({
  loading,
  error,
  fetchReport,
  reportData,
  onSelectDay,
  t,
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <FaCalendarAlt className="text-primary" />
            <span>{t("studyTracker.calendarTitle", "Daily Study Calendar Breakdown")}</span>
          </h3>
          <p className="text-xs text-textSecondary mt-1">
            {t(
              "studyTracker.calendarSubtitle",
              "Click on any active day to inspect detailed course sessions and breakdown."
            )}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-textSecondary">{t("studyTracker.legendStudied", "Studied")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-surface border border-border"></div>
            <span className="text-textSecondary">{t("studyTracker.legendRest", "Rest Day")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-primary"></div>
            <span className="text-textSecondary">{t("studyTracker.legendToday", "Today")}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-surface/50 border border-border/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-textSecondary">
          <p className="text-red-500 mb-3">{error}</p>
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {t("common.retry", "Retry")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {(reportData?.daily_breakdown || []).map((day) => {
            const isStudied = !!day.is_studied;
            const isToday = !!day.is_today;
            const hasActivities = Array.isArray(day.activities) && day.activities.length > 0;

            return (
              <button
                key={day.day_number || day.date}
                type="button"
                onClick={() => {
                  if (isStudied || hasActivities) {
                    onSelectDay(day);
                  }
                }}
                disabled={!isStudied && !hasActivities}
                className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[110px] group ${
                  isToday
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : ""
                } ${
                  isStudied
                    ? "bg-gradient-to-br from-emerald-500/10 via-surface to-surface border-emerald-500/40 hover:border-emerald-500 hover:shadow-md cursor-pointer"
                    : "bg-surface/30 border-border/60 opacity-75 cursor-default"
                }`}
              >
                {/* Top: Day Number and Short Name */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center ${
                      isStudied
                        ? "bg-emerald-500 text-white shadow-sm"
                        : isToday
                        ? "bg-primary text-white"
                        : "bg-surface text-textSecondary border border-border"
                    }`}
                  >
                    {day.day_number}
                  </span>
                  <span className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">
                    {day.day_short || day.day_name?.slice(0, 3)}
                  </span>
                </div>

                {/* Middle / Bottom: Time & Status */}
                <div className="mt-2 w-full">
                  {isStudied ? (
                    <div>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <FaFire className="text-xs" />
                        <span>{day.study_formatted || `${day.study_hours}h`}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-textSecondary">
                          {day.sessions_count || (day.activities?.length ?? 1)}{" "}
                          {t("studyTracker.sessions", "sessions")}
                        </span>
                        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          {t("common.details", "Details")} →
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-textSecondary/60 italic">
                      {day.is_past ? t("studyTracker.noStudy", "No study") : "—"}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
