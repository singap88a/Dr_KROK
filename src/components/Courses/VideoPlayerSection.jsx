import React from "react";
import { FaList, FaLock, FaCalendarAlt, FaClock, FaVideo, FaGraduationCap, FaCheckCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { VideoPlayer } from "./LessonPlayer/VideoPlayer";
import { LessonAttachments } from "./LessonPlayer/LessonAttachments";
import { PeriodicQuizzesSection } from "./QuizSystem/PeriodicQuizzes";
import { LessonEndTestsSection } from "./QuizSystem/LessonEndTests";
import { QuizModal } from "./QuizSystem/QuizModal";
import { ResultsModal } from "./QuizSystem/ResultsModal";
import LessonInteractions from "./LessonInteractions";
import LessonFlashCards from "./LessonFlashCards";

export default function VideoPlayerSection({
  currentLesson,
  currentSection,
  hasAccess,
  isLoggedIn,
  course,
  id,
  lessonStatuses,
  quizModal,
  setQuizModal,
  resultsModal,
  setResultsModal,
  setAnsweredQuizzes,
  setQuizResults,
  onVideoTimeUpdate,
  onVideoEnd,
  onLessonComplete,
  onFileClick,
  onVideoClick,
  onImageClick,
  serverTimeOffset,
  currentTimeMs,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  hasFreeLessons,
  formatSessionTimeRaw,
  isLinkActive,
  getTimeUntilStart,
  setShowPurchaseModal,
  isLiveCourse = false,
  groupId = null,
}) {
  const { t } = useTranslation();

  const shouldShowContent = () => {
    if (currentLesson) {
      const isFree = currentLesson.type === "free" || currentLesson.type === "Free" || currentLesson.is_free === true;
      const isActive = isLiveCourse ? (currentLesson.status === "active" || currentLesson.status === "Active") : true;
      return (!hasAccess && isFree) || (hasAccess && isActive);
    }
    if (currentSection) {
      const isFree = currentSection.type === "free" || currentSection.type === "Free" || (hasFreeLessons && hasFreeLessons(currentSection.id));
      const isActive = isLiveCourse ? (currentSection.status === "active" || currentSection.status === "Active") : true;
      return (!hasAccess && isFree) || (hasAccess && isActive);
    }
    return false;
  };

  const showContent = shouldShowContent();

  // Helper: render the session schedule + join button (used when content IS visible)
  const renderActiveSessionCard = () => {
    if (!isLiveCourse) return null;
    const startedAt = currentLesson?.started_at || currentSection?.started_at;
    if (!startedAt) return null;

    const rawTime = formatSessionTimeRaw ? formatSessionTimeRaw(startedAt) : null;
    const statusRaw = currentLesson?.status || currentSection?.status;
    const isLectureEnded = statusRaw && statusRaw.toString().toLowerCase() === "active";
    let active = false;
    let link = null;
    if (currentLesson?.zoom_link) {
      active = isLinkActive ? isLinkActive(currentLesson.started_at, serverTimeOffset, currentTimeMs) : false;
      link = currentLesson.zoom_link;
    } else if (currentSection?.zoom_link) {
      active = isLinkActive ? isLinkActive(currentSection.started_at, serverTimeOffset, currentTimeMs) : false;
      link = currentSection.zoom_link;
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

            {rawTime && (
              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight text-primary">{rawTime.localTime}</div>
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <span>{rawTime.localDate}</span>
                  <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary text-white shadow-sm">
                    {t("liveCourses.localTimeShort", "Local")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-text-muted opacity-80 bg-accent/40 w-fit px-2 py-1 rounded-lg">
                  <FaClock className="text-primary/60" />
                  <span>{t("liveCourses.ukraineTime", "Ukraine")}: {rawTime.ukraineTime}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 min-w-[220px]">
            {isLectureEnded ? (
              <div className="space-y-2">
                <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-white bg-gray-400 rounded-2xl cursor-not-allowed opacity-70">
                  <FaVideo /> {t("liveCourses.joinLiveSession", "Join Live Session")}
                </button>
                <p className="text-[11px] text-center text-text-muted leading-tight">
                  {t("liveCourses.sessionEndedShort", "The live session has ended.")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <a
                  href={active ? link : undefined}
                  target={active ? "_blank" : undefined}
                  rel={active ? "noopener noreferrer" : undefined}
                  onClick={(e) => !active && e.preventDefault()}
                  className={`group w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-white transition-all duration-300 rounded-2xl shadow-lg ${active
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
                      const remaining = getTimeUntilStart ? getTimeUntilStart(startedAt, serverTimeOffset, currentTimeMs) : null;
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
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Helper: render full inactive session screen (when session not yet active)
  const renderInactiveSession = () => {
    const startedAt = currentLesson?.started_at || currentSection?.started_at;
    const raw = formatSessionTimeRaw && startedAt ? formatSessionTimeRaw(startedAt) : null;

    let active = false;
    let link = null;
    if (currentLesson?.zoom_link) {
      active = isLinkActive ? isLinkActive(currentLesson.started_at, serverTimeOffset, currentTimeMs) : false;
      link = currentLesson.zoom_link;
    } else if (currentSection?.zoom_link) {
      active = isLinkActive ? isLinkActive(currentSection.started_at, serverTimeOffset, currentTimeMs) : false;
      link = currentSection.zoom_link;
    }

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

          {startedAt && raw && (
            <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2">
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
                  <div className="text-xs font-bold text-text-muted">{raw.localDate}</div>
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
                  <div className="text-3xl font-black text-text/80 mb-1">{raw.ukraineTime}</div>
                  <div className="text-xs font-bold text-text-muted italic">
                    {t("liveCourses.referenceOnly", "Reference Only")}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <a
              href={active ? link : undefined}
              target={active ? "_blank" : undefined}
              rel={active ? "noopener noreferrer" : undefined}
              onClick={(e) => !active && e.preventDefault()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 font-bold text-white transition-all duration-300 rounded-2xl shadow-lg ${active
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
                  <FaClock className="animate-spin" style={{ animationDuration: "3s" }} />
                  <span>{t("liveCourses.linkOpensSoonShort", "Link activates 5m before start")}</span>
                </div>
                {(() => {
                  const remaining = getTimeUntilStart ? getTimeUntilStart(
                    currentLesson?.started_at || currentSection?.started_at,
                    serverTimeOffset,
                    currentTimeMs
                  ) : null;
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
  };

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* Video Player */}
      <div className="border rounded-lg bg-surface border-border">
        {currentLesson || currentSection ? (
          <div className="relative">
            {showContent ? (
              <>
                <div className="relative aspect-video">
                  <VideoPlayer
                    currentLesson={currentLesson}
                    currentSection={currentSection}
                    handleVideoTimeUpdate={onVideoTimeUpdate}
                    handleVideoEnd={onVideoEnd}
                  />
                  <QuizModal
                    quizModal={quizModal}
                    setQuizModal={setQuizModal}
                    setAnsweredQuizzes={setAnsweredQuizzes}
                    setQuizResults={setQuizResults}
                  />
                  <ResultsModal
                    resultsModal={resultsModal}
                    setResultsModal={setResultsModal}
                  />
                </div>

                <div className="p-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-text">
                    {currentLesson?.title || currentSection?.title}
                  </h3>

                  {/* ── Stats Bar (Likes & Quick Scroll to Comments) ── */}
                  {currentLesson && (
                    <LessonInteractions
                      key={`stats-${currentLesson.id}`}
                      lessonId={currentLesson.id}
                      batchLessonId={currentLesson.batch_lesson_id}
                      isLiveCourse={isLiveCourse}
                      groupId={groupId}
                      mode="stats"
                      hasAccess={hasAccess}
                    />
                  )}

                  {/* Mark as Completed Button */}
                  {isLoggedIn && currentLesson?.video && onLessonComplete && (
                    <div className="mt-3">
                      {(() => {
                        const isCompleted = lessonStatuses && lessonStatuses[currentLesson.id] && 
                          (lessonStatuses[currentLesson.id].progress_status === 'completed' || lessonStatuses[currentLesson.id].percentage >= 100);
                        
                        return (
                          <button
                            onClick={(e) => {
                              if (isCompleted) return;
                              e.preventDefault();
                              e.stopPropagation();
                              onLessonComplete(currentLesson.id);
                            }}
                            disabled={isCompleted}
                            className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors ${
                              isCompleted 
                                ? "bg-green-600 cursor-not-allowed opacity-90" 
                                : "bg-primary hover:bg-secondary"
                            }`}
                          >
                            {isCompleted 
                              ? (
                                <span className="flex items-center gap-2">
                                  <FaCheckCircle /> {t("courses.lessonCompleted", "Lesson Completed")}
                                </span>
                              )
                              : t("courses.markCompleted", "Mark as Completed")}
                          </button>
                        );
                      })()}
                    </div>
                  )}

                  {/* Session description */}
                  {(currentLesson?.description || currentSection?.description) && (
                    <div className="mt-3 text-sm text-text-secondary">
                      <div
                        className={`leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}
                        dangerouslySetInnerHTML={{ __html: currentLesson?.description || currentSection?.description }}
                      />
                      {(currentLesson?.description || currentSection?.description || "").length > 150 && (
                        <button
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          className="mt-1 text-sm font-medium underline text-primary hover:text-primary/80 cursor-pointer"
                        >
                          {isDescriptionExpanded ? t("common.showLess", "Show Less") : t("common.showMore", "Show More")}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Live Session Schedule & Join Link - Active Content */}
                  {isLiveCourse && renderActiveSessionCard()}

                  {/* Attachments */}
                  <LessonAttachments
                    content={currentLesson || currentSection}
                    setSelectedImage={onImageClick}
                    setShowImagePopup={() => { }}
                    handleFileClick={onFileClick}
                    handleVideoClick={onVideoClick}
                  />

                  {/* Quizzes */}
                  {currentLesson && (
                    <>
                      <PeriodicQuizzesSection lesson={currentLesson} />
                      <LessonEndTestsSection
                        lesson={currentLesson}
                        lessonStatuses={lessonStatuses}
                        id={id}
                        course={course}
                        isLive={isLiveCourse}
                      />
                    </>
                  )}

                  {/* ── Flash Cards Section (Placed above comments) ── */}
                  {currentLesson && (
                    <LessonFlashCards
                      lessonId={currentLesson.id}
                      isLiveCourse={isLiveCourse}
                      hasAccess={hasAccess}
                    />
                  )}

                  {/* ── Discussion Section (at the bottom, after all lesson content) ── */}
                  {currentLesson && (
                    <div className="mt-6">
                      <LessonInteractions
                        key={`full-${currentLesson.id}`}
                        lessonId={currentLesson.id}
                        batchLessonId={currentLesson.batch_lesson_id}
                        isLiveCourse={isLiveCourse}
                        groupId={groupId}
                        mode="full"
                        hasAccess={hasAccess}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              isLiveCourse ? (
                renderInactiveSession()
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-accent/20 aspect-video">
                  <FaLock className="mb-4 text-4xl text-text-muted" />
                  <p className="text-lg font-semibold">{t("courses.contentLocked", "Premium Content Locked")}</p>
                  <p className="mt-2 text-sm text-text-muted">{t("courses.enrollToAccess", "Enroll in this course to access this lesson.")}</p>
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="px-6 py-2 mt-4 text-white rounded-lg bg-primary hover:bg-secondary"
                  >
                    {t("courses.enrollNow", "Enroll Now")}
                  </button>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="relative flex items-center justify-center overflow-hidden bg-accent aspect-video">
            {course?.image && (
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img
                  src={Array.isArray(course.image) ? course.image[0] : course.image}
                  alt={course.title}
                  className="object-cover w-full h-full opacity-30 blur-sm"
                />
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px]"></div>
              </div>
            )}
            <div className="relative z-10 text-center p-6">
              <FaList className="mx-auto mb-4 text-6xl text-text-muted drop-shadow-md" />
              <p className="font-medium text-text drop-shadow-md">
                {t("courses.selectContent", "Select a lesson or section to start")}
              </p>
              {!hasAccess && (
                <div className="p-4 mt-4 border border-yellow-300 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <FaLock className="text-yellow-600" />
                    <span className="font-medium">{t("liveCourses.premiumContentLocked", "Premium Content Locked")}</span>
                  </div>
                  <p className="mt-2 text-sm text-yellow-700">
                    {t("liveCourses.premiumContentMessage", "You need to enroll in this course to access all premium lessons and materials.")}
                  </p>
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="px-4 py-2 mt-3 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                  >
                    {t("liveCourses.enrollNowToUnlock", "Enroll Now to Unlock")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructor Card - Below Video Player (Live Courses) */}
      {isLiveCourse && course?.instructor && (
        <div className="p-6 border rounded-lg bg-surface border-border">
          <h3 className="mb-4 text-lg font-semibold text-text">
            {t("courses.instructor", "Instructor")}
          </h3>
          <div className="flex items-start gap-4">
            <img
              src={course.instructor.image || "/placeholder-instructor.jpg"}
              alt={course.instructor.name}
              className="object-cover w-16 h-16 border-2 rounded-full border-primary"
            />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-text">{course.instructor.name}</h4>
              <p className="mb-2 font-medium text-primary">{course.instructor.job_title}</p>
              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <FaGraduationCap />
                  <span>{course.instructor.years_of_experience} {t("courses.yearsExp", "years experience")}</span>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-text line-clamp-3">{course.instructor.bio}</p>
              <Link
                to={`/instructors/${course.instructor.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
              >
                {t("instructors.viewDetails", "View Details")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

