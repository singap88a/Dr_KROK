import React from "react";
import { FaGraduationCap, FaCheckCircle, FaPaperclip, FaComments, FaFileAlt } from "react-icons/fa";
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
  lessonLoading = false,
  lessonError = null,
  onRetryLesson = null,
}) {
  const { t } = useTranslation();
  const {
    getLessonEssayQuestions,
    getLessonRecreationalQuizzes,
    getLessonFlashCards,
    getLiveLessonFlashCards,
  } = useApi();
  const [activeTab, setActiveTab] = React.useState("about");
  const [essayQuestions, setEssayQuestions] = React.useState([]);
  const [essayLoading, setEssayLoading] = React.useState(false);
  const [recreationalQuizzes, setRecreationalQuizzes] = React.useState([]);
  const [recreationalForbidden, setRecreationalForbidden] = React.useState(false);
  const [recreationalForbiddenMessage, setRecreationalForbiddenMessage] = React.useState(null);
  const [recreationalLoading, setRecreationalLoading] = React.useState(false);
  const [flashcardsCount, setFlashcardsCount] = React.useState(0);
  const [flashcardsLoading, setFlashcardsLoading] = React.useState(false);

  const content = currentLesson || currentSection;
  const hasAttachments = content && (
    (content.images && content.images.length > 0) ||
    (content.files && content.files.length > 0) ||
    (content.video_related && content.video_related.length > 0)
  );

  const endTestType = isLiveCourse
    ? "Lesson-End Test (Live Session)"
    : "Lesson-End Test (Video Session)";
  const matchingLessonTestsCount = currentLesson
    ? (currentLesson.lesson_end_tests || []).filter(
        (test) =>
          test.test_type === endTestType ||
          (test.test_type && test.test_type.includes("Periodic Quiz"))
      ).length + (currentLesson.periodic_quizzes?.length || 0)
    : 0;

  const totalHomeworkItems =
    recreationalQuizzes.length +
    matchingLessonTestsCount +
    (flashcardsCount > 0 ? 1 : 0) +
    (essayQuestions.length > 0 ? 1 : 0);

  const tabs = [
    { id: "about", label: t("courses.tabs.about", "About"), icon: <FaFileAlt className="text-xs" /> },
    ...(hasAttachments ? [{ id: "attachments", label: t("courses.tabs.attachments", "Files"), icon: <FaPaperclip className="text-xs" /> }] : []),
    ...(currentLesson
      ? [
          {
            id: "homework",
            label: t("courses.tabs.homework", "Homework"),
            icon: <FaGraduationCap className="text-xs" />,
            badge: totalHomeworkItems > 0 ? totalHomeworkItems : null,
          },
        ]
      : []),
    ...(currentLesson ? [{ id: "comments", label: t("courses.tabs.comments", "Discussions"), icon: <FaComments className="text-xs" /> }] : []),
  ];

  // Fetch homework resources (essay questions, recreational quizzes, flashcards count) whenever lesson changes
  React.useEffect(() => {
    if (!currentLesson?.id) {
      setEssayQuestions([]);
      setRecreationalQuizzes([]);
      setRecreationalForbidden(false);
      setRecreationalForbiddenMessage(null);
      setFlashcardsCount(0);
      return;
    }
    let cancelled = false;
    const lessonType = isLiveCourse ? "live" : "video";

    // 1. Essay questions
    setEssayLoading(true);
    setEssayQuestions([]);
    getLessonEssayQuestions(currentLesson.id, lessonType)
      .then((data) => {
        if (!cancelled) setEssayQuestions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("📝 [Essay] Error:", err);
        if (!cancelled) setEssayQuestions([]);
      })
      .finally(() => { if (!cancelled) setEssayLoading(false); });

    // 2. Recreational quizzes
    setRecreationalLoading(true);
    setRecreationalQuizzes([]);
    setRecreationalForbidden(false);
    setRecreationalForbiddenMessage(null);
    getLessonRecreationalQuizzes(currentLesson.id, lessonType)
      .then((res) => {
        if (!cancelled) {
          setRecreationalQuizzes(Array.isArray(res?.quizzes) ? res.quizzes : []);
          setRecreationalForbidden(Boolean(res?.forbidden));
          setRecreationalForbiddenMessage(res?.message || null);
        }
      })
      .catch((err) => {
        console.error("🎮 [Recreational] Error:", err);
        if (!cancelled) {
          setRecreationalQuizzes([]);
          setRecreationalForbidden(false);
          setRecreationalForbiddenMessage(null);
        }
      })
      .finally(() => { if (!cancelled) setRecreationalLoading(false); });

    // 3. Flashcards count
    setFlashcardsLoading(true);
    setFlashcardsCount(0);
    const fetchFlash = isLiveCourse
      ? getLiveLessonFlashCards(currentLesson.id, 1, 5)
      : getLessonFlashCards(currentLesson.id, 1, 5);
    fetchFlash
      .then((res) => {
        if (!cancelled) {
          const total =
            res?.meta?.total ??
            res?.pagination?.total ??
            (Array.isArray(res?.data) ? res.data.length : 0);
          setFlashcardsCount(Number(total || 0));
        }
      })
      .catch(() => {
        if (!cancelled) setFlashcardsCount(0);
      })
      .finally(() => { if (!cancelled) setFlashcardsLoading(false); });

    return () => { cancelled = true; };
  }, [
    currentLesson?.id,
    isLiveCourse,
    getLessonEssayQuestions,
    getLessonRecreationalQuizzes,
    getLessonFlashCards,
    getLiveLessonFlashCards,
  ]);

  React.useEffect(() => {
    const availableTabIds = [
      "about",
      ...(hasAttachments ? ["attachments"] : []),
      ...(currentLesson ? ["homework", "comments"] : []),
    ];
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab("about");
    }
  }, [currentLesson, currentSection, hasAttachments, activeTab]);

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
      <div className="border rounded-lg bg-surface border-border overflow-hidden">
        {lessonLoading ? (
          <div className="relative aspect-video flex flex-col items-center justify-center bg-gray-900/95 text-white animate-pulse">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-gray-300">
              {t("courses.loadingLesson", "Loading lesson content...")}
            </p>
          </div>
        ) : lessonError ? (
          <div className="relative aspect-video flex flex-col items-center justify-center bg-surface p-6 text-center">
            <p className="text-red-500 font-medium mb-3">{lessonError}</p>
            {onRetryLesson && (
              <button
                onClick={onRetryLesson}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
              >
                {t("common.retry", "Retry")}
              </button>
            )}
          </div>
        ) : (currentLesson || currentSection) ? (
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
                        const currentStatus = lessonStatuses && lessonStatuses[currentLesson.id];
                        const lessonHasTests = Boolean(
                          (currentLesson?.lesson_end_tests && currentLesson.lesson_end_tests.length > 0) ||
                          (currentLesson?.periodic_quizzes && currentLesson.periodic_quizzes.length > 0) ||
                          (currentLesson?.quizzes && currentLesson.quizzes.length > 0) ||
                          (currentLesson?.tests && currentLesson.tests.length > 0) ||
                          currentLesson?.has_quiz ||
                          currentLesson?.has_tests
                        );

                        const isCompleted = currentStatus && (
                          currentStatus.progress_status === 'completed' ||
                          currentStatus.status === 'completed' ||
                          currentStatus.percentage >= 100 ||
                          (!lessonHasTests && (currentStatus.percentage >= 50 || currentStatus.lesson_percentage >= 100))
                        );

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
                    essayQuestions={essayQuestions}
                    essayLoading={essayLoading}
                    recreationalQuizzes={recreationalQuizzes}
                    recreationalForbidden={recreationalForbidden}
                    recreationalForbiddenMessage={recreationalForbiddenMessage}
                    recreationalLoading={recreationalLoading}
                    flashcardsCount={flashcardsCount}
                    flashcardsLoading={flashcardsLoading}
                    setShowPurchaseModal={setShowPurchaseModal}
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
