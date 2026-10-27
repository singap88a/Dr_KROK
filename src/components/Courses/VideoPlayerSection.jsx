import React from "react";
import { FaGraduationCap, FaCheckCircle, FaPaperclip, FaComments, FaRegCopy, FaFileAlt, FaEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { VideoPlayer } from "./LessonPlayer/VideoPlayer";
import { QuizModal } from "./QuizSystem/QuizModal";
import { ResultsModal } from "./QuizSystem/ResultsModal";
import LessonInteractions from "./LessonInteractions";
import { LiveInactiveSessionScreen } from "./LessonPlayer/LiveSessionStatus";
import LessonPlayerTabs from "./LessonPlayer/LessonPlayerTabs";
import {
  LessonPlayerLockedState,
  LessonPlayerEmptyState,
  LiveCoursePlayerInstructor,
} from "./LessonPlayer/LessonPlayerPlaceholders";
import { useApi } from "../../context/ApiContext";

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
  const { getLessonEssayQuestions } = useApi();
  const [activeTab, setActiveTab] = React.useState("about");
  const [essayQuestions, setEssayQuestions] = React.useState([]);
  const [essayLoading, setEssayLoading] = React.useState(false);

  const content = currentLesson || currentSection;
  const hasAttachments = content && (
    (content.images && content.images.length > 0) ||
    (content.files && content.files.length > 0) ||
    (content.video_related && content.video_related.length > 0)
  );

  const hasQuizzes = currentLesson && (
    (currentLesson.lesson_end_tests && currentLesson.lesson_end_tests.length > 0) ||
    (currentLesson.periodic_quizzes && currentLesson.periodic_quizzes.length > 0)
  );

  const tabs = [
    { id: "about", label: t("courses.tabs.about", "About"), icon: <FaFileAlt className="text-xs" /> },
    ...(hasAttachments ? [{ id: "attachments", label: t("courses.tabs.attachments", "Files"), icon: <FaPaperclip className="text-xs" /> }] : []),
    ...(hasQuizzes ? [{ id: "quizzes", label: t("courses.tabs.quizzes", "Quizzes"), icon: <FaGraduationCap className="text-xs" /> }] : []),
    ...(currentLesson ? [{ id: "flashcards", label: t("courses.tabs.flashcards", "Flashcards"), icon: <FaRegCopy className="text-xs" /> }] : []),
    ...(essayQuestions.length > 0 ? [{ id: "essay", label: t("courses.tabs.essay", "Essay"), icon: <FaEdit className="text-xs" /> }] : []),
    ...(currentLesson ? [{ id: "comments", label: t("courses.tabs.comments", "Discussions"), icon: <FaComments className="text-xs" /> }] : []),
  ];

  // Fetch essay questions whenever lesson changes
  React.useEffect(() => {
    if (!currentLesson?.id) {
      setEssayQuestions([]);
      return;
    }
    let cancelled = false;
    setEssayLoading(true);
    setEssayQuestions([]);
    const lessonType = isLiveCourse ? "live" : "video";
    getLessonEssayQuestions(currentLesson.id, lessonType)
      .then((data) => {
        if (!cancelled) setEssayQuestions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("📝 [Essay] Error:", err);
        if (!cancelled) setEssayQuestions([]);
      })
      .finally(() => { if (!cancelled) setEssayLoading(false); });
    return () => { cancelled = true; };
  }, [currentLesson?.id, isLiveCourse]);

  React.useEffect(() => {
    const isTabAvailable = tabs.some(tab => tab.id === activeTab);
    if (!isTabAvailable) {
      setActiveTab("about");
    }
  }, [currentLesson?.id, currentSection?.id, hasAttachments, hasQuizzes, essayQuestions.length]);

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
                      onCommentClick={() => setActiveTab("comments")}
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

                  {/* Tab Navigation & Tab Panels */}
                  <LessonPlayerTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    currentLesson={currentLesson}
                    currentSection={currentSection}
                    isLiveCourse={isLiveCourse}
                    groupId={groupId}
                    hasAccess={hasAccess}
                    isDescriptionExpanded={isDescriptionExpanded}
                    setIsDescriptionExpanded={setIsDescriptionExpanded}
                    hasAttachments={hasAttachments}
                    hasQuizzes={hasQuizzes}
                    essayQuestions={essayQuestions}
                    onImageClick={onImageClick}
                    onFileClick={onFileClick}
                    onVideoClick={onVideoClick}
                    lessonStatuses={lessonStatuses}
                    id={id}
                    course={course}
                    formatSessionTimeRaw={formatSessionTimeRaw}
                    isLinkActive={isLinkActive}
                    getTimeUntilStart={getTimeUntilStart}
                    serverTimeOffset={serverTimeOffset}
                    currentTimeMs={currentTimeMs}
                  />
                </div>
              </>
            ) : (
              isLiveCourse ? (
                <LiveInactiveSessionScreen
                  currentLesson={currentLesson}
                  currentSection={currentSection}
                  formatSessionTimeRaw={formatSessionTimeRaw}
                  isLinkActive={isLinkActive}
                  getTimeUntilStart={getTimeUntilStart}
                  serverTimeOffset={serverTimeOffset}
                  currentTimeMs={currentTimeMs}
                />
              ) : (
                <LessonPlayerLockedState setShowPurchaseModal={setShowPurchaseModal} />
              )
            )}
          </div>
        ) : (
          <LessonPlayerEmptyState
            course={course}
            hasAccess={hasAccess}
            setShowPurchaseModal={setShowPurchaseModal}
          />
        )}
      </div>

      {/* Instructor Card - Below Video Player (Live Courses) */}
      <LiveCoursePlayerInstructor
        course={course}
        isLiveCourse={isLiveCourse}
      />
    </div>
  );
}
