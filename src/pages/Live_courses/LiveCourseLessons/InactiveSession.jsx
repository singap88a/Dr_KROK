// LiveCourseLessons/InactiveSession.jsx
import React from "react";
import { motion } from "framer-motion";
import { FaClock, FaVideo, FaCalendarAlt } from "react-icons/fa";

export default function InactiveSession({
  currentLesson,
  currentSection,
  serverTimeOffset,
  currentTimeMs,
  formatSessionTimeRaw,
  isLinkActive,
  getTimeUntilStart,
  t,
  isInactiveMessageOnly = false
}) {
  const getLinkStatus = () => {
    let active = false;
    let link = null;
    if (currentLesson && currentLesson.zoom_link) {
      active = isLinkActive(currentLesson.started_at, serverTimeOffset, currentTimeMs);
      link = currentLesson.zoom_link;
    } else if (currentSection && currentSection.zoom_link) {
      active = isLinkActive(currentSection.started_at, serverTimeOffset, currentTimeMs);
      link = currentSection.zoom_link;
    }
    return { active, link };
  };

  const statusRaw = currentLesson?.status || currentSection?.status;
  const isLectureEnded = statusRaw && statusRaw.toString().toLowerCase() === "active";
  const { active, link } = getLinkStatus();

  // If it's just the inactive message (no schedule card)
  if (isInactiveMessageOnly) {
    return (
      <div className="p-10 text-center bg-surface sm:p-16">
        <div className="max-w-xl mx-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20"
          >
            <FaClock className="text-4xl" />
          </motion.div>

          <h3 className="mb-3 text-2xl font-bold text-text">
            {t("liveCourses.sessionInactive", "Session is Currently Inactive")}
          </h3>
          <p className="mb-8 text-text-muted">
            {t("liveCourses.sessionInactiveMessageLong", "This session hasn't started yet. Check the schedule below for your local time.")}
          </p>

          {(currentLesson?.started_at || currentSection?.started_at) && (
            <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2">
              {(() => {
                const raw = formatSessionTimeRaw(currentLesson?.started_at || currentSection?.started_at);
                return raw && (
                  <>
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(var(--primary-rgb), 0.3)" }}
                      className="relative overflow-hidden p-6 border-2 rounded-3xl bg-surface shadow-xl border-primary/30 group transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                      <div className="relative z-10">
                        <div className="mb-2 text-[10px] font-black tracking-[0.2em] uppercase text-primary">
                          {t("liveCourses.yourLocalTime", "Your Local Time")}
                        </div>
                        <div className="text-3xl font-black text-text mb-1 group-hover:text-primary transition-colors">
                          {raw.localTime}
                        </div>
                        <div className="text-xs font-bold text-text-muted">
                          {raw.localDate}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      whileHover={{ y: -5 }}
                      className="relative overflow-hidden p-6 border-2 rounded-3xl bg-accent/20 shadow-lg border-border group transition-all duration-300"
                    >
                      <div className="relative z-10">
                        <div className="mb-2 text-[10px] font-black tracking-[0.2em] uppercase text-text-muted opacity-60">
                          {t("liveCourses.ukraineTimeShort", "Ukraine")}
                        </div>
                        <div className="text-3xl font-black text-text/80 mb-1">
                          {raw.ukraineTime}
                        </div>
                        <div className="text-xs font-bold text-text-muted italic">
                          {t("liveCourses.referenceOnly", "Reference Only")}
                        </div>
                      </div>
                    </motion.div>
                  </>
                );
              })()}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <a
              href={active ? link : undefined}
              target={active ? "_blank" : undefined}
              rel={active ? "noopener noreferrer" : undefined}
              onClick={(e) => !active && e.preventDefault()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 font-bold text-white transition-all duration-300 rounded-2xl shadow-lg ${
                active 
                ? "bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-[1.03] active:scale-95" 
                : "bg-gray-400 cursor-not-allowed opacity-80"
              }`}
            >
              <FaVideo className={active ? "animate-pulse" : ""} />
              {t("liveCourses.viewMeetingLink", "View Meeting Link")}
            </a>
            
            {!active && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center gap-3 px-6 py-3 border-2 rounded-2xl bg-red-50/30 border-red-100 dark:bg-red-900/10 dark:border-red-800/20 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs font-black text-red-600 dark:text-red-400">
                  <FaClock className="animate-spin-slow" />
                  <span>{t("liveCourses.linkOpensSoonShort", "Link activates 5m before start")}</span>
                </div>
                {(() => {
                  const remaining = getTimeUntilStart(currentLesson?.started_at || currentSection?.started_at, serverTimeOffset, currentTimeMs);
                  return remaining && (
                    <div className="sm:ml-3 sm:pl-3 sm:border-l-2 border-red-200 dark:border-red-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-xs font-black text-primary">
                        {t("liveCourses.in", "In")}: {remaining}
                      </span>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full schedule card with join link
  if (isLectureEnded) {
    return (
      <div className="p-6 mt-6 border-2 rounded-2xl bg-gradient-to-br from-surface to-accent/20 border-primary/20">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <FaCalendarAlt size={14} />
              </div>
              <span className="text-sm font-semibold tracking-wide uppercase text-text-muted">
                {t("liveCourses.sessionSchedule", "Session Schedule")}
              </span>
            </div>
            <div className="space-y-2">
              <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-white bg-gray-400 rounded-2xl cursor-not-allowed opacity-70">
                <FaVideo /> {t("liveCourses.joinLiveSession", "Join Live Session")}
              </button>
              <p className="text-[11px] text-center text-text-muted leading-tight">
                {t("liveCourses.sessionEndedShort", "The live session has ended.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(var(--primary-rgb), 0.2)" }}
      className="p-6 mt-6 border-2 shadow-sm rounded-2xl bg-gradient-to-br from-surface to-accent/20 border-primary/20 hover:border-primary/40 transition-colors duration-300"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary"
            >
              <FaCalendarAlt size={14} />
            </motion.div>
            <span className="text-sm font-semibold tracking-wide uppercase text-text-muted">
              {t("liveCourses.sessionSchedule", "Session Schedule")}
            </span>
          </div>
          
          <div className="space-y-1">
            {(() => {
              const rawTime = formatSessionTimeRaw(currentLesson?.started_at || currentSection?.started_at);
              return rawTime && (
                <>
                  <div className="text-3xl font-black tracking-tight text-primary">
                    {rawTime.localTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                    <span>{rawTime.localDate}</span>
                    <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary text-white shadow-sm">
                      {t("liveCourses.localTimeShort", "Local")}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>

          {(() => {
            const rawTime = formatSessionTimeRaw(currentLesson?.started_at || currentSection?.started_at);
            return rawTime && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-text-muted opacity-80 bg-accent/40 w-fit px-2 py-1 rounded-lg">
                <FaClock className="text-primary/60" />
                <span>{t("liveCourses.ukraineTime", "Ukraine")}: {rawTime.ukraineTime}</span>
              </div>
            );
          })()}
        </div>

        <div className="flex flex-col gap-3 min-w-[220px]">
          <div className="space-y-3">
            <a
              href={active ? link : undefined}
              target={active ? "_blank" : undefined}
              rel={active ? "noopener noreferrer" : undefined}
              onClick={(e) => !active && e.preventDefault()}
              className={`group w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-white transition-all duration-300 rounded-2xl shadow-lg ${
                active 
                ? "bg-gradient-to-r from-primary to-secondary hover:shadow-primary/30 hover:scale-[1.03] active:scale-95" 
                : "bg-gray-400 cursor-not-allowed opacity-80"
              }`}
            >
              <FaVideo className={active ? "animate-bounce" : ""} />
              {t("liveCourses.joinLiveSession", "Join Live Session")}
            </a>
            {!active && (
              <div className="flex flex-col gap-2 p-4 border rounded-2xl bg-white/50 dark:bg-black/20 border-red-100 dark:border-red-900/20 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-bold text-red-500">
                  <FaClock className="animate-pulse" />
                  <span>{t("liveCourses.linkOpensSoonShort", "Link activates 5m before start")}</span>
                </div>
                {(() => {
                  const remaining = getTimeUntilStart(currentLesson?.started_at || currentSection?.started_at, serverTimeOffset, currentTimeMs);
                  return remaining && (
                    <div className="text-[11px] font-black text-primary flex items-center gap-1.5 mt-1 pt-1 border-t border-red-50 dark:border-red-900/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                      {t("liveCourses.startsIn", "Starts in")}: {remaining}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}