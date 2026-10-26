import React from "react";
import {
  FaCalendarAlt,
  FaTimes,
  FaVideo,
  FaBroadcastTower,
  FaQuestionCircle,
  FaBookOpen,
  FaClock,
} from "react-icons/fa";

export default function TrackerDayModal({ selectedDayModal, onClose, t }) {
  if (!selectedDayModal) return null;

  const formatActivityName = (type) => {
    switch (type) {
      case "video":
        return t("studyTracker.activityVideo", "Recorded Video");
      case "live":
        return t("studyTracker.activityLive", "Live Lecture");
      case "quiz":
        return t("studyTracker.activityQuiz", "Test / Quiz");
      case "reading":
        return t("studyTracker.activityReading", "Article / Reading");
      case "flashcard":
        return t("studyTracker.activityFlashcard", "Flashcards");
      default:
        return t("studyTracker.activityGeneral", "General Study");
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "video":
        return <FaVideo className="text-blue-500" />;
      case "live":
        return <FaBroadcastTower className="text-red-500 animate-pulse" />;
      case "quiz":
        return <FaQuestionCircle className="text-purple-500" />;
      case "reading":
        return <FaBookOpen className="text-emerald-500" />;
      default:
        return <FaClock className="text-amber-500" />;
    }
  };

  const formatSeconds = (sec) => {
    if (!sec || sec <= 0) return "0m";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) {
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${m}m`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FaCalendarAlt className="text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-text text-lg">
                {selectedDayModal.day_name}, {selectedDayModal.date}
              </h4>
              <p className="text-xs text-textSecondary">
                {t("studyTracker.totalSessionTime", "Total logged time:")}{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDayModal.study_formatted || `${selectedDayModal.study_hours}h`}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-textSecondary hover:text-text rounded-lg hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-textSecondary">
            {t("studyTracker.activitiesDone", "Courses & Activities Completed")}
          </h5>

          {selectedDayModal.activities && selectedDayModal.activities.length > 0 ? (
            <div className="space-y-2.5">
              {selectedDayModal.activities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface/60 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-base">
                      {getActivityIcon(act.activity_type)}
                    </div>
                    <div>
                      <div className="font-semibold text-text text-sm line-clamp-1">
                        {act.course_title ||
                          t("studyTracker.generalPlatform", "General Platform Study")}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-border text-textSecondary">
                          {formatActivityName(act.activity_type)}
                        </span>
                        {act.sessions && (
                          <span className="text-[11px] text-textSecondary">
                            {act.sessions} {t("studyTracker.sessions", "sessions")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-primary text-sm">
                      {formatSeconds(act.duration_seconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-surface/50 text-textSecondary text-sm">
              {t("studyTracker.generalStudyRecorded", "Study recorded for this day.")}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface hover:bg-surface/80 border border-border rounded-xl text-sm font-semibold text-text transition-colors"
          >
            {t("common.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
