// LiveCourseLessons/VideoPlayerSection.jsx
import React from "react";
import { FaList, FaLock } from "react-icons/fa";
import { VideoPlayer } from "../LessonPlayer/VideoPlayer";
import { LessonAttachments } from "../LessonPlayer/LessonAttachments";
import { PeriodicQuizzesSection } from "../QuizSystem/PeriodicQuizzes";
import { LessonEndTestsSection } from "../QuizSystem/LessonEndTests";
import { QuizModal } from "../QuizSystem/QuizModal";
import { ResultsModal } from "../QuizSystem/ResultsModal";
import InactiveSession from "./InactiveSession";

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
  t
}) {
  // Determine if content should be shown
  const shouldShowContent = () => {
    if (currentLesson) {
      const isFree = currentLesson.type === "free" || currentLesson.type === "Free" || currentLesson.is_free === true;
      const isActive = currentLesson.status === "active" || currentLesson.status === "Active";
      return (!hasAccess && isFree) || (hasAccess && isActive);
    }
    if (currentSection) {
      const isFree = currentSection.type === "free" || currentSection.type === "Free" || hasFreeLessons(currentSection.id);
      const isActive = currentSection.status === "active" || currentSection.status === "Active";
      return (!hasAccess && isFree) || (hasAccess && isActive);
    }
    return false;
  };

  const showContent = shouldShowContent();

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* Video Player */}
      <div className="overflow-hidden border rounded-lg bg-surface border-border">
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

                  {/* Mark as Completed Button */}
                  {isLoggedIn && currentLesson?.video && (
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onLessonComplete(currentLesson.id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-secondary"
                      >
                        {t("courses.markCompleted", "Mark as Completed")}
                      </button>
                    </div>
                  )}

                  {/* Session description */}
                  {(currentLesson?.description || currentSection?.description) && (
                    <div className="mt-3 text-sm text-text-secondary">
                      <p 
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

                  {/* Session Schedule & Join Link */}
                  {(currentLesson?.started_at || currentSection?.started_at) && (
                    <InactiveSession
                      currentLesson={currentLesson}
                      currentSection={currentSection}
                      serverTimeOffset={serverTimeOffset}
                      currentTimeMs={currentTimeMs}
                      formatSessionTimeRaw={formatSessionTimeRaw}
                      isLinkActive={isLinkActive}
                      getTimeUntilStart={getTimeUntilStart}
                      t={t}
                    />
                  )}

                  {/* Attachments */}
                  <LessonAttachments
                    content={currentLesson || currentSection}
                    setSelectedImage={onImageClick}
                    setShowImagePopup={() => {}}
                    handleFileClick={onFileClick}
                    handleVideoClick={onVideoClick}
                    type={currentLesson ? "lesson" : "section"}
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
                      />
                    </>
                  )}
                </div>
              </>
            ) : (
              <InactiveSession
                currentLesson={currentLesson}
                currentSection={currentSection}
                serverTimeOffset={serverTimeOffset}
                currentTimeMs={currentTimeMs}
                formatSessionTimeRaw={formatSessionTimeRaw}
                isLinkActive={isLinkActive}
                getTimeUntilStart={getTimeUntilStart}
                t={t}
                isInactiveMessageOnly={true}
              />
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
    </div>
  );
}