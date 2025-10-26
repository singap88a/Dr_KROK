// LiveCourseLessons.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import i18n from "../../i18n";
import LoadingSpinner from "../../components/LoadingSpinner";
import SectionItem from "../Courses/SectionItem";
import {
  FaPlay,
  FaLock,
  FaMoon,
  FaSun,
  FaCheck,
  FaClock,
  FaBookOpen,
  FaArrowLeft,
  FaVideo,
  FaFileAlt,
  FaImage,
  FaDownload,
  FaStar,
  FaShoppingCart,
  FaEye,
  FaRegStar,
  FaUser,
  FaGraduationCap,
  FaCalendarAlt,
  FaLanguage,
  FaLevelUpAlt,
  FaUsers,
  FaStar as FaStarSolid,
  FaAward,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaList,
  FaQuestionCircle,
  FaChartLine,
  FaUnlock,
} from "react-icons/fa";

export default function LiveCourseLessons() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    getLiveCourseById,
    getCourseAccess,
    getLiveCourseProgress,
    startLiveLessonProgress,
    completeLiveLessonProgress,
    getLiveLessonProgress,
    getLiveCourseProgressDetails,
  } = useApi();
  const { isLoggedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [sections, setSections] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState({});
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFilesPopup, setShowFilesPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [progressLoading] = useState(false);
  const [sectionProgress, setSectionProgress] = useState({});

  // ========== STATES FOR PERIODIC QUIZZES ==========
  const [quizModal, setQuizModal] = useState({
    isOpen: false,
    currentQuiz: null,
    currentTest: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    showResult: false,
  });

  const [resultsModal, setResultsModal] = useState({
    isOpen: false,
    test: null,
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0,
  });

  const [answeredQuizzes, setAnsweredQuizzes] = useState(new Set());
  const [quizResults, setQuizResults] = useState({});
  const [processedQuizzes, setProcessedQuizzes] = useState(new Set());

  // Image Popup Modal
  const ImagePopup = () => {
    if (!showImagePopup || !selectedImage) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={() => setShowImagePopup(false)}
      >
        <img
          src={selectedImage}
          alt="Selected lesson"
          className="max-w-full max-h-full rounded-lg shadow-lg"
          style={{ width: "600px", height: "400px", objectFit: "contain" }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={() => setShowImagePopup(false)}
          className="absolute text-3xl font-bold text-white top-4 right-4"
          aria-label="Close image popup"
        >
          &times;
        </button>
      </div>
    );
  };

  // PDF Popup Modal
  const PDFPopup = () => {
    if (!showFilesPopup || !selectedFile) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={() => setShowFilesPopup(false)}
      >
        <div
          className="w-full max-w-4xl p-6 mx-4 rounded-lg dark:bg-gray-800 h-4/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilesPopup(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={t("common.close", "Close")}
            >
              <FaTimes className="text-xl text-teal-50" />
            </button>
          </div>
          <div className="h-full border rounded-lg">
            <iframe
              src={`${selectedFile}#toolbar=0`}
              className="w-full h-full rounded-lg"
              title="PDF Viewer"
            />
          </div>
        </div>
      </div>
    );
  };

  // Video Popup Modal
  const VideoPopup = () => {
    if (!showVideoPopup || !selectedVideo) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={() => setShowVideoPopup(false)}
      >
        <div
          className="w-full max-w-4xl p-4 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">
              {t("courses.additionalVideo", "Additional Video")}
            </h3>
            <button
              onClick={() => setShowVideoPopup(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={t("common.close", "Close")}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="aspect-video">
            <video
              src={selectedVideo}
              controls
              className="w-full h-full rounded"
              autoPlay
            />
          </div>
        </div>
      </div>
    );
  };

  // ========== PERIODIC QUIZZES MODALS ==========

  // Quiz Modal for periodic quizzes - positioned exactly over video
  const QuizModal = () => {
    if (!quizModal.isOpen || !quizModal.currentQuiz) return null;

    const { currentQuiz, currentQuestionIndex } = quizModal;

    // Handle quiz submission
    const handleQuizSubmit = (answerIndex) => {
      const { currentQuiz, userAnswers, currentQuestionIndex } = quizModal;

      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestionIndex] = answerIndex;

      // Store result without showing it immediately
      const isCorrect = answerIndex === currentQuiz.correct_answer_index;

      // Update quiz results
      setQuizResults((prev) => ({
        ...prev,
        [currentQuiz.id]: {
          question: currentQuiz.title,
          userAnswer: answerIndex,
          correctAnswer: currentQuiz.correct_answer_index,
          isCorrect: isCorrect,
          score: isCorrect ? parseInt(currentQuiz.question_score) : 0,
          showAtTime: currentQuiz.show_at_time,
        },
      }));

      // Mark this quiz as answered
      setAnsweredQuizzes((prev) => new Set([...prev, currentQuiz.id]));

      // Close modal and resume video immediately
      setQuizModal({
        isOpen: false,
        currentQuiz: null,
        currentTest: null,
        currentQuestionIndex: 0,
        userAnswers: [],
        showResult: false,
      });

      // Resume video
      const videoElement = document.querySelector("video");
      if (videoElement) {
        videoElement.play();
      }
    };

    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#00000086]">
        <div className="flex items-center justify-center w-full h-full p-4">
          <div className="w-full max-w-lg overflow-hidden transition-all transform shadow-xl bg-surface rounded-2xl">
            {/* Header */}
            <div className="p-4 text-white bg-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full bg-opacity-20">
                    <FaChartLine className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {t("courses.quickQuiz", "Quick Quiz")}
                    </h3>
                    <p className="text-xs text-white text-opacity-90">
                      {t("courses.atTime", "At")} {currentQuiz.show_at_time}s
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-white rounded-full bg-opacity-20">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              {/* Question */}
              <div className="mb-4">
                <h4 className="mb-3 text-sm font-semibold leading-relaxed text-text">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        currentQuiz.title || t("courses.question", "Question"),
                    }}
                  />
                </h4>

                {/* Answers */}
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((index) => {
                    const answer = currentQuiz[`answer_${index}`];
                    if (!answer) return null;

                    return (
                      <button
                        key={index}
                        onClick={() => handleQuizSubmit(index - 1)}
                        className="w-full p-3 text-sm text-left transition-all border rounded-lg cursor-pointer bg-surface border-border hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-medium text-gray-500 border border-gray-300 rounded-full">
                            {String.fromCharCode(64 + index)}
                          </div>
                          <span className="text-sm font-medium text-text">
                            {answer}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setQuizModal({
                      isOpen: false,
                      currentQuiz: null,
                      currentTest: null,
                      currentQuestionIndex: 0,
                      userAnswers: [],
                      showResult: false,
                    });
                    // Resume video
                    const videoElement = document.querySelector("video");
                    if (videoElement) {
                      videoElement.play();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium transition-colors rounded-lg text-text bg-accent hover:bg-accent/80"
                >
                  {t("common.skip", "Skip")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Results Modal for showing final quiz results
  const ResultsModal = () => {
    if (!resultsModal.isOpen) return null;

    const { totalQuestions, correctAnswers, score } = resultsModal;
    const isExcellent = score >= 90;
    const isGood = score >= 70;
    const isAverage = score >= 50;

    const getPerformanceMessage = () => {
      if (isExcellent)
        return {
          message: t(
            "courses.excellentMessage",
            "Outstanding! You've mastered this lesson completely."
          ),
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: "🏆",
        };
      if (isGood)
        return {
          message: t(
            "courses.goodMessage",
            "Great job! You have a solid understanding of the material."
          ),
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          icon: "⭐",
        };
      if (isAverage)
        return {
          message: t(
            "courses.averageMessage",
            "Good effort! You understand the main concepts."
          ),
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: "📚",
        };
      return {
        message: t(
          "courses.poorMessage",
          "Keep practicing! Review the material and try again."
        ),
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: "💪",
      };
    };

    const performance = getPerformanceMessage();

    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#00000086]">
        <div className="flex items-center justify-center w-full h-full p-4">
          <div className="w-full max-w-xs overflow-hidden transition-all transform shadow-xl bg-surface rounded-xl">
            {/* Header */}
            <div className="p-3 text-white bg-primary">
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <div className="p-1 bg-white rounded-full bg-opacity-20">
                    <FaTimes className="text-sm" />
                  </div>
                </div>
                <h3 className="text-sm font-bold">
                  {t("courses.quizCompleted", "Quiz Completed!")}
                </h3>
                <p className="mt-0.5 text-[10px] text-white text-opacity-90">
                  {t("courses.videoCompleted", "Video Completed")}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 bg-surface">
              {/* Score Circle */}
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                      isExcellent
                        ? "border-green-500"
                        : isGood
                        ? "border-blue-500"
                        : isAverage
                        ? "border-yellow-500"
                        : "border-orange-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-text">
                        {score}%
                      </div>
                      <div className="text-[9px] text-text-muted">
                        {t("courses.score", "Score")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 text-center border rounded-lg bg-background border-border">
                  <div className="text-base font-bold text-green-600">
                    {correctAnswers}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {t("courses.correct", "Correct")}
                  </div>
                </div>
                <div className="p-2 text-center border rounded-lg bg-background border-border">
                  <div className="text-base font-bold text-red-600">
                    {totalQuestions - correctAnswers}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {t("courses.incorrect", "Incorrect")}
                  </div>
                </div>
              </div>

              {/* Performance Message */}
              <div
                className={`p-2 mb-3 rounded-lg ${performance.bgColor} ${performance.borderColor} border`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-base">{performance.icon}</span>
                  <div>
                    <p
                      className={`text-[11px] font-medium ${performance.color} leading-tight`}
                    >
                      {performance.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-muted">
                    {t("courses.progress", "Progress")}
                  </span>
                  <span className="text-[10px] font-bold text-text">
                    {correctAnswers}/{totalQuestions}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-accent">
                  <div
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      isExcellent
                        ? "bg-green-500"
                        : isGood
                        ? "bg-blue-500"
                        : isAverage
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                    }`}
                    style={{
                      width: `${(correctAnswers / totalQuestions) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  setResultsModal({ ...resultsModal, isOpen: false })
                }
                className="w-full px-3 py-2 text-xs font-medium text-white transition-all transform rounded-lg bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95"
              >
                {t("common.continue", "Continue")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get all periodic quizzes from current lesson
  const getPeriodicQuizzes = () => {
    if (!currentLesson || !currentLesson.lesson_end_tests) return [];

    return currentLesson.lesson_end_tests.filter(
      (test) => test.test_type === "Periodic Quiz (Live Session)"
    );
  };

  // Handle video time update for periodic quizzes
  const handleVideoTimeUpdate = (e) => {
    const time = Math.floor(e.target.currentTime);

    // Check if there's a quiz at this time that hasn't been processed yet
    const periodicQuizzes = getPeriodicQuizzes();
    let foundQuiz = null;
    let foundTest = null;
    let questionIndex = 0;

    periodicQuizzes.forEach((test) => {
      test.quizzes.forEach((quiz, idx) => {
        if (
          quiz.show_at_time === time &&
          !processedQuizzes.has(quiz.id) &&
          !answeredQuizzes.has(quiz.id)
        ) {
          foundQuiz = quiz;
          foundTest = test;
          questionIndex = idx;
        }
      });
    });

    if (foundQuiz) {
      // Pause video
      e.target.pause();

      // Mark quiz as processed
      setProcessedQuizzes((prev) => new Set([...prev, foundQuiz.id]));

      // Show quiz modal
      setQuizModal({
        isOpen: true,
        currentQuiz: foundQuiz,
        currentTest: foundTest,
        currentQuestionIndex: questionIndex,
        userAnswers: [],
        showResult: false,
      });
    }
  };

  // Show final results when video ends
  const handleVideoEnd = async () => {
    // Calculate final results for periodic quizzes
    const periodicQuizzes = getPeriodicQuizzes();

    if (periodicQuizzes.length > 0) {
      let totalQuestions = 0;
      let correctAnswers = 0;
      let totalScore = 0;
      let maxScore = 0;

      periodicQuizzes.forEach((test) => {
        test.quizzes.forEach((quiz) => {
          totalQuestions++;
          maxScore += parseInt(quiz.question_score) || 50;

          const result = quizResults[quiz.id];
          if (result) {
            if (result.isCorrect) {
              correctAnswers++;
              totalScore += result.score;
            }
          }
        });
      });

      if (totalQuestions > 0) {
        // Wait a moment before showing results
        setTimeout(() => {
          setResultsModal({
            isOpen: true,
            test: periodicQuizzes[0],
            totalQuestions,
            correctAnswers,
            score: Math.round((totalScore / maxScore) * 100),
          });
        }, 1000);
      }
    }

    // Mark lesson as completed
    if (isLoggedIn && currentLesson) {
      try {
        const currentStatus = lessonStatuses[currentLesson.id] || {};
        const hasTests =
          currentLesson.lesson_end_tests &&
          currentLesson.lesson_end_tests.length > 0;

        let newPercentage = 100;
        let type = "lesson";

        if (hasTests) {
          // إذا كان هناك اختبارات، يكمل الفيديو فقط (50%)
          const quizCompleted = currentStatus.quiz_percentage >= 100;
          newPercentage = quizCompleted ? 100 : 50;
        }

        // تحديث فوري للواجهة
        setLessonStatuses((prev) => ({
          ...prev,
          [currentLesson.id]: {
            ...prev[currentLesson.id],
            lesson_percentage: 100,
            percentage: newPercentage,
            status: newPercentage === 100 ? "completed" : "in_progress",
          },
        }));

        // استخدام النوع الصحيح 'lesson' لإكمال الفيديو
        const res = await completeLiveLessonProgress(
          id,
          currentLesson.id,
          "lesson"
        );
        if (res?.course_progress) setCourseProgress(res.course_progress);
        if (res?.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [currentLesson.id]: {
              ...prev[currentLesson.id],
              ...res.lesson,
            },
          }));
        }
        // Refresh from server to ensure persistence
        await updateLessonStatus(currentLesson.id);
      } catch (error) {
        // Handle error silently
      }
    }
  };

  // Reset processed quizzes when lesson changes
  useEffect(() => {
    setProcessedQuizzes(new Set());
    setAnsweredQuizzes(new Set());
    setQuizResults({});
  }, [currentLesson?.id]);

  // دالة محسنة لحساب التقدم الكلي للدرس بناءً على النظام الجديد
  const calculateTotalProgress = useCallback((lesson, lessonStatus) => {
    if (!lessonStatus) return 0;

    // إذا كان status مباشرة completed نرجع 100%
    if (
      lessonStatus.status === "completed" ||
      lessonStatus.progress_status === "completed"
    ) {
      return 100;
    }

    // استخدام النسبة المئوية المباشرة من API إذا كانت متوفرة
    if (
      lessonStatus.percentage !== undefined &&
      lessonStatus.percentage !== null
    ) {
      return Math.min(100, Math.max(0, lessonStatus.percentage));
    }

    // التحقق مما إذا كان الدرس يحتوي على فيديو و/أو اختبارات
    const hasVideo = !!lesson.video;
    const hasTests =
      lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;

    let totalProgress = 0;

    if (hasVideo && hasTests) {
      // إذا كان يحتوي على فيديو واختبارات: 50% للفيديو + 50% للاختبار
      const videoProgress = lessonStatus.lesson_percentage || 0;
      const quizProgress = lessonStatus.quiz_percentage || 0;

      // إذا اكتمل الفيديو فقط: 50%
      if (videoProgress >= 100 && quizProgress < 100) {
        totalProgress = 50;
      }
      // إذا اكتمل الاختبار فقط: 50%
      else if (quizProgress >= 100 && videoProgress < 100) {
        totalProgress = 50;
      }
      // إذا اكتمل الاثنان: 100%
      else if (videoProgress >= 100 && quizProgress >= 100) {
        totalProgress = 100;
      }
      // إذا لم يكتمل أي منهما: النسبة الأعلى
      else {
        totalProgress = Math.max(videoProgress, quizProgress) / 2;
      }
    } else if (hasTests && !hasVideo) {
      // إذا كان يحتوي على اختبارات فقط: 100% للاختبار
      totalProgress = lessonStatus.quiz_percentage || 0;
    } else if (hasVideo && !hasTests) {
      // إذا كان يحتوي على فيديو فقط: 100% للفيديو
      totalProgress = lessonStatus.lesson_percentage || 0;
    }

    return Math.min(100, totalProgress);
  }, []);

  // دالة محسنة لتحديث حالة الدرس
  const updateLessonStatus = useCallback(
    async (lessonId) => {
      if (!isLoggedIn) return;

      try {
        const [updatedCourseProgress, updatedLessonProgress] =
          await Promise.all([
            getLiveCourseProgressDetails(id),
            getLiveLessonProgress(id, lessonId),
          ]);

        if (updatedCourseProgress) {
          setCourseProgress(updatedCourseProgress);

          // تحديث تقدم الأقسام
          if (updatedCourseProgress.sections_progress) {
            const sectionProgressData = {};
            updatedCourseProgress.sections_progress.forEach((section) => {
              sectionProgressData[section.section_id] = section.progress;
            });
            setSectionProgress(sectionProgressData);
          }
        }

        if (updatedLessonProgress?.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [lessonId]: updatedLessonProgress.lesson,
          }));
        }
      } catch (error) {
        console.error(`Error updating lesson ${lessonId} status:`, error);
      }
    },
    [isLoggedIn, id, getLiveCourseProgressDetails, getLiveLessonProgress]
  );

  // دالة محسنة لإكمال الدرس - تحديث فوري للواجهة
  const handleLessonComplete = async (lessonId) => {
    let lesson = null;

    // البحث في جميع الدروس من جميع الأقسام
    lesson = lessons.find((l) => l.id === lessonId);

    if (!lesson && sections.length > 0) {
      for (const section of sections) {
        if (section.lessons) {
          lesson = section.lessons.find((l) => l.id === lessonId);
          if (lesson) break;
        }
      }
    }

    if (!lesson && currentLesson && currentLesson.id === lessonId) {
      lesson = currentLesson;
    }

    if (!lesson) {
      console.log("Lesson not found in any source");
      return;
    }

    // تحديد النسبة المئوية بناءً على محتوى الدرس
    const hasVideo = !!lesson.video;
    const hasTests =
      lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;

    let newPercentage = 100;
    let lessonPercentage = 100;
    let quizPercentage = 0;

    if (hasVideo && hasTests) {
      // إذا كان يحتوي على فيديو واختبارات، يكمل الفيديو فقط (50%)
      const currentStatus = lessonStatuses[lessonId] || {};
      const quizCompleted = currentStatus.quiz_percentage >= 100;
      newPercentage = quizCompleted ? 100 : 50;
      lessonPercentage = 100;
      quizPercentage = quizCompleted ? 100 : currentStatus.quiz_percentage || 0;
    } else if (hasVideo && !hasTests) {
      // إذا كان يحتوي على فيديو فقط: 100%
      newPercentage = 100;
      lessonPercentage = 100;
    } else if (hasTests && !hasVideo) {
      // إذا كان يحتوي على اختبارات فقط: 100%
      newPercentage = 100;
      quizPercentage = 100;
    }

    // تحديث فوري للواجهة
    setLessonStatuses((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        percentage: newPercentage,
        status: newPercentage === 100 ? "completed" : "in_progress",
        lesson_percentage: lessonPercentage,
        quiz_percentage: quizPercentage,
      },
    }));

    try {
      // استدعاء API لإكمال الدرس - استخدم 'lesson' للنوع
      const response = await completeLiveLessonProgress(id, lessonId, "lesson");
      if (response.success) {
        // تحديث حالة الدرس من الاستجابة
        if (response.data && response.data.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [lessonId]: {
              ...prev[lessonId],
              ...response.data.lesson,
            },
          }));
        }

        // تحديث التقدم العام للدورة
        const updatedProgress = await getLiveCourseProgressDetails(id);
        if (updatedProgress) {
          setCourseProgress(updatedProgress);

          // تحديث تقدم الأقسام
          if (updatedProgress.sections_progress) {
            const sectionProgressData = {};
            updatedProgress.sections_progress.forEach((section) => {
              sectionProgressData[section.section_id] = section.progress;
            });
            setSectionProgress(sectionProgressData);
          }
        }
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      // في حالة الخطأ، إعادة التحديث من الخادم
      await updateLessonStatus(lessonId);
    }
  };

  // دالة لحساب تقدم القسم
  const calculateSectionProgress = useCallback(
    (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons || section.lessons.length === 0) {
        return 0;
      }

      let totalProgress = 0;
      let completedLessons = 0;

      section.lessons.forEach((lesson) => {
        const lessonStatus = lessonStatuses[lesson.id];
        const progress = calculateTotalProgress(lesson, lessonStatus);
        totalProgress += progress;
        if (progress === 100) {
          completedLessons++;
        }
      });

      const averageProgress = totalProgress / section.lessons.length;
      return {
        percentage: Math.round(averageProgress),
        completedLessons,
        totalLessons: section.lessons.length,
      };
    },
    [sections, lessonStatuses, calculateTotalProgress]
  );

  // ========== مكونات الاختبارات المختلفة ==========

  // مكون لعرض اختبارات نهاية الدرس (Lesson-End Test)
  const LessonEndTestsSection = ({ lesson }) => {
    if (!lesson.lesson_end_tests || lesson.lesson_end_tests.length === 0) {
      return null;
    }

    // تصفية اختبارات نهاية الدرس فقط
    const lessonEndTests = lesson.lesson_end_tests.filter(
      (test) => test.test_type === "Lesson-End Test (Live Session)"
    );

    if (lessonEndTests.length === 0) {
      return null;
    }

    const lessonProgress = lessonStatuses[lesson.id] || {};
    const progressPercentage =
      lessonProgress.percentage || lessonProgress.lesson_percentage || 0;
    const canTakeTest = progressPercentage >= 50;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <FaQuestionCircle className="text-lg text-white" />
          </div>
          <div>
            <h5 className="text-lg font-bold text-text">
              {t("courses.lessonEndTests", "Lesson End Assessment")}
            </h5>
            <p className="text-sm text-text-muted">
              {t(
                "courses.testLessonKnowledge",
                "Evaluate your understanding of this lesson"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {lessonEndTests.map((test, idx) => (
            <div
              key={test.id || idx}
              className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                canTakeTest
                  ? "border-blue-500/20 bg-blue-500/5 hover:border-blue-500 hover:shadow-lg hover:bg-blue-500/10"
                  : "border-border bg-accent hover:border-border/80"
              }`}
              onClick={() => {
                if (canTakeTest) {
                  navigate(`/live-courses/${id}/test/lesson/${test.id}`, {
                    state: {
                      course,
                      test,
                      lessonId: lesson.id,
                    },
                  });
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      canTakeTest
                        ? "bg-blue-500 text-white"
                        : "bg-text-muted text-background"
                    }`}
                  >
                    {canTakeTest ? <FaUnlock /> : <FaLock />}
                  </div>
                  <div>
                    <h6 className="font-semibold text-text">
                      {test.name ||
                        `${t("courses.lessonEndTest", "Lesson End Test")} ${
                          idx + 1
                        }`}
                    </h6>
                    <p className="mt-1 text-xs text-text-muted">
                      {test.description &&
                        test.description
                          .replace(/<[^>]*>/g, "")
                          .substring(0, 100)}
                      {test.description && test.description.length > 100
                        ? "..."
                        : ""}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    canTakeTest
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-accent text-text-muted"
                  }`}
                >
                  {canTakeTest
                    ? t("courses.available", "Available")
                    : t("courses.locked", "Locked")}
                </div>
              </div>

              {canTakeTest && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-muted">
                      {t("courses.lessonProgress", "Lesson Progress")}
                    </span>
                    <span className="text-xs font-bold text-text">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent">
                    <div
                      className="h-2 transition-all duration-500 bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {!canTakeTest && (
                <p className="flex items-center gap-1 mt-2 text-xs text-red-500">
                  <FaLock className="text-xs" />
                  {t(
                    "courses.watchVideoToUnlockTest",
                    "Watch 50% of the lesson to unlock"
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // مكون لعرض الاختبارات الدورية (Periodic Quiz)
  const PeriodicQuizzesSection = ({ lesson }) => {
    if (!lesson.lesson_end_tests || lesson.lesson_end_tests.length === 0) {
      return null;
    }

    // تصفية الاختبارات الدورية فقط
    const periodicQuizzes = lesson.lesson_end_tests.filter(
      (test) => test.test_type === "Periodic Quiz (Live Session)"
    );

    if (periodicQuizzes.length === 0) {
      return null;
    }

    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500 rounded-lg">
            <FaClock className="text-lg text-white" />
          </div>
          <div>
            <h5 className="text-lg font-bold text-text">
              {t("courses.periodicQuizzes", "Periodic Quizzes")}
            </h5>
            <p className="text-sm text-text-muted">
              {t(
                "courses.quickKnowledgeChecks",
                "Quick knowledge checks during the lesson"
              )}
            </p>
          </div>
        </div>

        <div className="p-4 border-2 border-green-500/20 bg-green-500/5 rounded-xl">
          <div className="text-center">
            <p className="mb-2 text-sm text-text-muted">
              {t(
                "courses.quizzesWillAppear",
                "Quizzes will appear automatically during the video"
              )}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {t("courses.automaticAppearance", "Automatic appearance")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  {t("courses.videoPauses", "Video pauses during quiz")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // مكون لعرض اختبارات القسم (Section Tests)
  const SectionTestsSection = ({ section }) => {
    if (!section.lesson_end_tests || section.lesson_end_tests.length === 0) {
      return null;
    }

    const sectionProgress = calculateSectionProgress(section.id);
    const canTakeTest = sectionProgress.percentage >= 70;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500 rounded-lg">
            <FaBookOpen className="text-lg text-white" />
          </div>
          <div>
            <h5 className="text-lg font-bold text-text">
              {t("courses.sectionTests", "Section Assessment")}
            </h5>
            <p className="text-sm text-text-muted">
              {t(
                "courses.testSectionKnowledge",
                "Comprehensive test for this entire section"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {section.lesson_end_tests.map((test, idx) => (
            <div
              key={test.id || idx}
              className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                canTakeTest
                  ? "border-purple-500/20 bg-purple-500/5 hover:border-purple-500 hover:shadow-lg hover:bg-purple-500/10"
                  : "border-border bg-accent hover:border-border/80"
              }`}
              onClick={() => {
                if (canTakeTest) {
                  navigate(`/live-courses/${id}/test/section/${test.id}`, {
                    state: {
                      course,
                      test,
                      sectionId: section.id,
                    },
                  });
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      canTakeTest
                        ? "bg-purple-500 text-white"
                        : "bg-text-muted text-background"
                    }`}
                  >
                    {canTakeTest ? <FaUnlock /> : <FaLock />}
                  </div>
                  <div>
                    <h6 className="font-semibold text-text">
                      {test.name ||
                        `${t("courses.sectionTest", "Section Test")} ${
                          idx + 1
                        }`}
                    </h6>
                    <p className="mt-1 text-xs text-text-muted">
                      {test.description &&
                        test.description
                          .replace(/<[^>]*>/g, "")
                          .substring(0, 100)}
                      {test.description && test.description.length > 100
                        ? "..."
                        : ""}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    canTakeTest
                      ? "bg-purple-500/10 text-purple-500"
                      : "bg-accent text-text-muted"
                  }`}
                >
                  {canTakeTest
                    ? t("courses.available", "Available")
                    : t("courses.locked", "Locked")}
                </div>
              </div>

              {canTakeTest && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-muted">
                      {t("courses.sectionProgress", "Section Progress")}
                    </span>
                    <span className="text-xs font-bold text-text">
                      {Math.round(sectionProgress.percentage)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent">
                    <div
                      className="h-2 transition-all duration-500 bg-purple-500 rounded-full"
                      style={{
                        width: `${Math.min(sectionProgress.percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {!canTakeTest && (
                <p className="flex items-center gap-1 mt-2 text-xs text-red-500">
                  <FaLock className="text-xs" />
                  {t(
                    "courses.completeSectionToUnlockTest",
                    "Complete 70% of the section to unlock"
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // FinalTestsSection - تم نقله للجانب الأيمن فقط
  const FinalTestsSection = () => {
    if (!course || !course.final_tests || course.final_tests.length === 0) {
      return null;
    }

    const overallProgress = Math.round(courseProgress?.overall?.percentage || 0);
    const canTakeTest = overallProgress >= 100;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500">
            <FaAward className="text-lg text-white" />
          </div>
          <div>
            <h5 className="text-lg font-bold text-text">
              {t("courses.finalTests", "Final Tests")}
            </h5>
            <p className="text-sm text-text-muted">
              {t(
                "courses.finalAssessment",
                "Comprehensive final assessment for the entire course"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {course.final_tests.map((test, idx) => (
            <div
              key={test.id || idx}
              className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                canTakeTest
                  ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500 hover:shadow-lg hover:bg-emerald-500/10"
                  : "border-border bg-accent hover:border-border/80"
              }`}
              onClick={() => {
                if (canTakeTest) {
                  navigate(`/live-courses/${id}/test/final/${test.id}`, {
                    state: { course, test },
                  });
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      canTakeTest
                        ? "bg-emerald-500 text-white"
                        : "bg-text-muted text-background"
                    }`}
                  >
                    {canTakeTest ? <FaUnlock /> : <FaLock />}
                  </div>
                  <div>
                    <h6 className="font-semibold text-text">
                      {test.name ||
                        `${t("courses.finalTest", "Final Test")} ${idx + 1}`}
                    </h6>
                    <p className="mt-1 text-xs text-text-muted">
                      {test.description &&
                        test.description
                          .replace(/<[^>]*>/g, "")
                          .substring(0, 100)}
                      {test.description && test.description.length > 100
                        ? "..."
                        : ""}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    canTakeTest
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-accent text-text-muted"
                  }`}
                >
                  {canTakeTest
                    ? t("courses.available", "Available")
                    : t("courses.locked", "Locked")}
                </div>
              </div>

              {canTakeTest && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-muted">
                      {t("courses.overallProgress", "Overall Progress")}
                    </span>
                    <span className="text-xs font-bold text-text">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent">
                    <div
                      className="h-2 transition-all duration-500 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(overallProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {!canTakeTest && (
                <p className="flex items-center gap-1 mt-2 text-xs text-red-500">
                  <FaLock className="text-xs" />
                  {t(
                    "courses.completeCourseToUnlockTest",
                    "Complete the entire course to unlock final exams"
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ... باقي الكود بدون تغيير (useEffect, useMemo, وغيرها)

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load course details (includes lessons) with auth token if logged in
        const courseData = await getLiveCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(courseData);
        setLessons(courseData.lessons || []);
        setSections(courseData.sections || []);

        // Initialize expanded sections with sections that have free lessons
        const sectionsWithFreeLessons = new Set();
        if (courseData.sections) {
          courseData.sections.forEach((section) => {
            if (
              section.lessons &&
              section.lessons.some(
                (lesson) => lesson.type === "free" || lesson.type === "Free"
              )
            ) {
              sectionsWithFreeLessons.add(section.id);
            }
          });
        }
        setExpandedSections(sectionsWithFreeLessons);

        // تحميل حالة التقدم للدروس من البيانات التي تأتي مباشرة من API
        if (courseData?.lessons?.length) {
          const initialStatuses = {};
          courseData.lessons.forEach((lesson) => {
            if (lesson.percentage !== undefined || lesson.status) {
              initialStatuses[lesson.id] = {
                percentage: lesson.percentage || 0,
                status: lesson.status || "not_started",
                lesson_percentage: lesson.lesson_percentage || 0,
                quiz_percentage: lesson.quiz_percentage || 0,
              };
            }
          });
          setLessonStatuses(initialStatuses);
        }

        // تحميل التقدم الإضافي إذا كان المستخدم مسجل الدخول
        if (isLoggedIn) {
          try {
            const courseProgressDetails = await getLiveCourseProgressDetails(
              id
            );
            if (courseProgressDetails) {
              setCourseProgress(courseProgressDetails);

              // تحديث حالة الدروس من بيانات تقدم الأقسام
              const updatedStatuses = { ...lessonStatuses };
              if (courseProgressDetails.sections_progress) {
                courseProgressDetails.sections_progress.forEach((section) => {
                  if (section.lessons) {
                    section.lessons.forEach((lesson) => {
                      if (lesson.lesson_id) {
                        updatedStatuses[lesson.lesson_id] = {
                          ...updatedStatuses[lesson.lesson_id],
                          percentage: lesson.percentage || 0,
                          status: lesson.status || "not_started",
                        };
                      }
                    });
                  }
                });

                // تحديث تقدم الأقسام
                const sectionProgressData = {};
                courseProgressDetails.sections_progress.forEach((section) => {
                  sectionProgressData[section.section_id] = section.progress;
                });
                setSectionProgress(sectionProgressData);
              }
              setLessonStatuses(updatedStatuses);
            }
          } catch (error) {
            console.log("Failed to load course progress details:", error);
            try {
              const oldProgress = await getLiveCourseProgress(id);
              setCourseProgress(oldProgress);
            } catch {
              // ignore
            }
          }
        }

        // Check access if logged in
        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id);
            setHasAccess(access);
          } catch {
            setHasAccess(courseData.price === 0 || courseData.price === "0");
          }
        } else {
          setHasAccess(false);
        }

        // Set first free content as current if available
        if (courseData.sections && courseData.sections.length > 0) {
          let firstFreeContent = null;
          for (const section of courseData.sections) {
            if (section.lessons && section.lessons.length > 0) {
              const firstFreeLesson = section.lessons.find(
                (lesson) => lesson.type === "free" || lesson.type === "Free"
              );
              if (firstFreeLesson) {
                firstFreeContent = { type: "lesson", data: firstFreeLesson };
                break;
              }
            }
          }

          if (!firstFreeContent) {
            const firstSectionWithFree = courseData.sections.find(
              (section) =>
                section.lessons &&
                section.lessons.some(
                  (lesson) => lesson.type === "free" || lesson.type === "Free"
                )
            );
            if (firstSectionWithFree) {
              firstFreeContent = {
                type: "section",
                data: firstSectionWithFree,
              };
            }
          }

          if (!firstFreeContent && courseData.sections[0]) {
            firstFreeContent = {
              type: "section",
              data: courseData.sections[0],
            };
          }

          if (firstFreeContent) {
            if (firstFreeContent.type === "lesson") {
              setCurrentLesson(firstFreeContent.data);
              if (isLoggedIn) {
                try {
                  const res = await startLiveLessonProgress(
                    id,
                    firstFreeContent.data.id
                  );
                  if (res?.course_progress)
                    setCourseProgress(res.course_progress);
                  if (res?.lesson) {
                    setLessonStatuses((prev) => ({
                      ...prev,
                      [firstFreeContent.data.id]: {
                        ...prev[firstFreeContent.data.id],
                        ...res.lesson,
                      },
                    }));
                  }
                } catch {
                  /* noop */
                }
              }
            } else if (firstFreeContent.type === "section") {
              setCurrentSection(firstFreeContent.data);
            }
          }
        } else if (courseData.lessons && courseData.lessons.length > 0) {
          const firstFreeLesson = courseData.lessons.find(
            (lesson) => lesson.type === "free" || lesson.type === "Free"
          );
          if (firstFreeLesson) {
            setCurrentLesson(firstFreeLesson);
            if (isLoggedIn) {
              try {
                const res = await startLiveLessonProgress(
                  id,
                  firstFreeLesson.id
                );
                if (res?.course_progress)
                  setCourseProgress(res.course_progress);
                if (res?.lesson) {
                  setLessonStatuses((prev) => ({
                    ...prev,
                    [firstFreeLesson.id]: {
                      ...prev[firstFreeLesson.id],
                      ...res.lesson,
                    },
                  }));
                }
              } catch {
                /* noop */
              }
            }
          }
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load course lessons");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    const handleLanguageChange = () => {
      loadData();
    };
    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      mounted = false;
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [
    id,
    getLiveCourseById,
    getCourseAccess,
    getLiveCourseProgress,
    getLiveCourseProgressDetails,
    startLiveLessonProgress,
    getLiveLessonProgress,
    isLoggedIn,
    updateLessonStatus,
  ]);

  // When returning from quiz page, update the specific lesson status and overall progress
  useEffect(() => {
    const s = location.state || {};
    if (s.lessonCompleted && s.lessonId && isLoggedIn) {
      (async () => {
        try {
          await updateLessonStatus(s.lessonId);
        } catch (error) {
          console.error("Error updating lesson status after quiz:", error);
        }
      })();
    } else if (s.courseCompleted && isLoggedIn) {
      (async () => {
        try {
          const updatedProgress = await getLiveCourseProgressDetails(id);
          setCourseProgress(updatedProgress);
        } catch (error) {
          console.error("Error updating course progress:", error);
        }
      })();
    }
  }, [
    location.state,
    id,
    isLoggedIn,
    getLiveCourseProgressDetails,
    updateLessonStatus,
  ]);

  // Sort lessons: free first, then paid (kept for backward compatibility)
  const _sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const aFree = a.type === "free" || a.type === "Free";
      const bFree = b.type === "free" || b.type === "Free";
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
      return (a.id || 0) - (b.id || 0);
    });
  }, [lessons]);

  // Sort sections by ID
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [sections]);

  // Get lessons for a specific section
  const getSectionLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return [];
      return [...section.lessons].sort((a, b) => {
        const aFree = a.type === "free" || a.type === "Free";
        const bFree = b.type === "free" || b.type === "Free";
        if (aFree && !bFree) return -1;
        if (!aFree && bFree) return 1;
        return (a.id || 0) - (b.id || 0);
      });
    };
  }, [sections]);

  // Check if section has free lessons
  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return false;
      return section.lessons.some(
        (lesson) => lesson.type === "free" || lesson.type === "Free"
      );
    };
  }, [sections]);

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Helper function to safely convert video_related to array
  const getVideoRelatedArray = (videoRelated) => {
    if (!videoRelated) return [];
    if (Array.isArray(videoRelated)) return videoRelated;
    return [videoRelated];
  };

  const handleLessonClick = async (lesson) => {
    const isFree = lesson.type === "free" || lesson.type === "Free";
    if (!isFree) {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      setShowPurchaseModal(true);
      return;
    }

    setCurrentLesson(lesson);
    setCurrentSection(null);
    if (isLoggedIn) {
      try {
        const res = await startLiveLessonProgress(id, lesson.id);
        if (res?.course_progress) setCourseProgress(res.course_progress);
        if (res?.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [lesson.id]: {
              ...prev[lesson.id],
              ...res.lesson,
            },
          }));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSectionClick = (section) => {
    const hasFree = hasFreeLessons(section.id);
    if (!hasFree && !hasAccess) {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      setShowPurchaseModal(true);
      return;
    }

    setCurrentSection(section);
    setCurrentLesson(null);
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowFilesPopup(true);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoPopup(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-sm text-text-muted" />);
      }
    }
    return stars;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    }
  };

  // Small circular progress indicator for lesson items
  const ProgressCircle = ({
    percent = 0,
    size = 32,
    stroke = 4,
    completed = false,
    active = false,
  }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    const offset = circumference * (1 - clamped / 100);
    const trackColor = active ? "#22c55e33" : "#94a3b833";
    const barColor = completed ? "#22c55e" : active ? "#22c55e" : "#0ea5e9";

    return (
      <svg width={size} height={size} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={barColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {completed ? (
          <g transform={`translate(${size / 2 - 6} ${size / 2 - 6})`}>
            <FaCheck className="text-xs text-green-500" />
          </g>
        ) : (
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="8"
            fill={active ? "#fff" : "#334155"}
            fontWeight="bold"
          >
            {clamped}%
          </text>
        )}
      </svg>
    );
  };

  // Section Progress Bar Component
  const SectionProgressBar = ({ sectionId }) => {
    const progress = calculateSectionProgress(sectionId);
    const sectionProgressData = sectionProgress[sectionId];

    const displayPercentage =
      sectionProgressData?.percentage || progress.percentage;
    const displayCompleted =
      sectionProgressData?.completed_lessons || progress.completedLessons;
    const displayTotal =
      sectionProgressData?.total_lessons || progress.totalLessons;

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1 text-xs">
          <span className="text-text-muted">
            {t("courses.sectionProgress", "Section Progress")}
          </span>
          <span className="font-medium">{displayPercentage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-accent">
          <div
            className={`h-1.5 rounded-full ${
              displayPercentage === 100 ? "bg-green-500" : "bg-primary"
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, displayPercentage))}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-text-muted">
          <span>
            {displayCompleted} of {displayTotal}{" "}
            {t("courses.lessons", "lessons")} completed
          </span>
          {displayPercentage === 100 && (
            <span className="font-semibold text-green-600">
              {t("courses.completed", "Completed")}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-text">
        <div className="text-red-600">
          {t("common.error", "Error")}:{" "}
          {error || t("courses.courseNotFound", "Course not found.")}
        </div>
        <Link
          to="/live-courses"
          className="px-4 py-2 text-white rounded-lg bg-primary hover:bg-secondary"
        >
          {t("courses.backToCourses", "Back to Courses")}
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-10 bg-background text-text dark:bg-background dark:text-text">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/live-courses/${id}`}
            className="inline-flex items-center gap-2 mb-4 transition-colors text-primary hover:text-secondary"
          >
            <FaArrowLeft />
            <span>{t("courses.backToCourse", "Back to Course")}</span>
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaBookOpen className="text-primary" />
                  <span>
                    {lessons.length} {t("courses.lessons", "Lessons")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-primary" />
                  <span>
                    {course.enrolled_count || 0}{" "}
                    {t("courses.students", "Students")}
                  </span>
                </div>
                {isLoggedIn && (
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary" />
                    <span>
                      {t("courses.progress", "Progress")}:{" "}
                      {progressLoading
                        ? "..."
                        : `${Math.round(
                            courseProgress?.overall?.percentage || 0
                          )}%`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(course.avg_rating || 0)}
                  </div>
                  <span className="text-sm">
                    {(course.avg_rating || 0).toFixed(1)} (
                    {course.ratings_count || 0})
                  </span>
                </div>
              </div>

              {/* Course Level & Language */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(
                    course.level
                  )}`}
                >
                  {course.level}
                </span>
                <span className="px-3 py-1 text-xs font-semibold border rounded-full bg-surface border-border">
                  {course.language}
                </span>
                {course.category && (
                  <span className="px-3 py-1 text-xs font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                    {course.category.name}
                  </span>
                )}
              </div>

              {isLoggedIn && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-text-muted">
                      {t("courses.overallProgress", "Overall Progress")}
                    </span>
                    <span className="font-medium">
                      {Math.round(courseProgress?.overall?.percentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-accent">
                    <div
                      className={`h-2 rounded-full ${
                        Math.round(courseProgress?.overall?.percentage || 0) ===
                        100
                          ? "bg-green-500"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Math.round(courseProgress?.overall?.percentage || 0)
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  {Math.round(courseProgress?.overall?.percentage || 0) ===
                    100 && (
                    <div className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-green-700 bg-green-100 rounded">
                      {t("courses.completed", "Completed")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price & Enroll */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    $
                    {(Number(course.discount) > 0
                      ? Number(course.price) - Number(course.discount)
                      : Number(course.price)
                    ).toFixed(2)}
                  </span>
                  {Number(course.discount) > 0 && (
                    <>
                      <span className="text-lg line-through text-text-muted">
                        ${Number(course.price).toFixed(2)}
                      </span>
                      <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                        {Math.round(
                          (Number(course.discount) / Number(course.price)) * 100
                        )}
                        %
                      </span>
                    </>
                  )}
                </div>
              </div>
              {!hasAccess && (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r bg-primary to-secondary hover:shadow-lg hover:scale-105"
                >
                  {t("courses.enrollNow", "Enroll Now")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sections and Lessons List */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-lg font-semibold">
              {t("courses.courseContent", "Course Content")}
            </h3>

            <div className="space-y-2">
              {sortedSections.map((section) => (
                <SectionItem
                  key={`section-${section.id}`}
                  section={section}
                  lessons={getSectionLessons(section.id)}
                  isExpanded={expandedSections.has(section.id)}
                  isActive={currentSection?.id === section.id}
                  hasFree={hasFreeLessons(section.id)}
                  isAccessible={hasFreeLessons(section.id) || hasAccess}
                  lessonStatuses={lessonStatuses}
                  currentLesson={currentLesson}
                  sectionProgress={sectionProgress}
                  calculateTotalProgress={calculateTotalProgress}
                  calculateSectionProgress={calculateSectionProgress}
                  onSectionClick={handleSectionClick}
                  onLessonClick={handleLessonClick}
                  onToggleSection={toggleSection}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                  course={course}
                />
              ))}

              {/* Final Tests Under Course Content - في الجانب الأيمن فقط */}
              <FinalTestsSection />

              {/* Certificate Section */}
              {isLoggedIn &&
                localStorage.getItem(`course_${id}_certificate`) && (
                  <div className="p-4 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-700">
                    <button
                      onClick={() =>
                        navigate(`/live-courses/${id}/certificate`)
                      }
                      className="flex items-center w-full gap-3 p-2 text-left transition-all rounded hover:bg-green-100 dark:hover:bg-green-800/50"
                    >
                      <div className="flex-shrink-0 p-2 bg-green-100 rounded-full dark:bg-green-800">
                        <FaAward className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          {t(
                            "courses.certificate",
                            "Certificate of Completion"
                          )}
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {t(
                            "courses.downloadCertificate",
                            "Download your certificate"
                          )}
                        </p>
                      </div>
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Video Player & Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Player */}
            <div className="overflow-hidden border rounded-lg bg-surface border-border">
              {currentLesson ? (
                <div className="relative">
                  <div className="relative aspect-video">
                    {currentLesson.video ? (
                      <video
                        src={currentLesson.video}
                        controls
                        className="w-full h-full"
                        poster={currentLesson.image}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={handleVideoEnd}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-accent">
                        <div className="text-center">
                          <FaVideo className="mx-auto mb-2 text-4xl text-text-muted" />
                          <p className="text-text-muted">
                            {t(
                              "courses.videoNotAvailable",
                              "Video not available"
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quiz Modal positioned exactly over video */}
                    {quizModal.isOpen && <QuizModal />}

                    {/* Results Modal positioned exactly over video */}
                    {resultsModal.isOpen && <ResultsModal />}
                  </div>
                  <div className="p-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text">
                      {currentLesson.title}
                    </h3>
                    {isLoggedIn && currentLesson.video && (
                      <div className="mt-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLessonComplete(currentLesson.id);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-secondary"
                        >
                          {t("courses.markCompleted", "Mark as Completed")}
                        </button>
                      </div>
                    )}
                    {currentLesson.description && (
                      <div className="mt-2 text-sm text-text-secondary">
                        <p className="leading-relaxed line-clamp-2">
                          {currentLesson.description}
                        </p>
                      </div>
                    )}

                    {/* Lesson Attachments */}
                    {(currentLesson.images &&
                      currentLesson.images.length > 0) ||
                    (currentLesson.files && currentLesson.files.length > 0) ||
                    (currentLesson.video_related &&
                      currentLesson.video_related.length > 0) ? (
                      <div className="mt-4">
                        <h4 className="mb-3 font-semibold text-md text-text">
                          {t("courses.lessonAttachments", "Lesson Attachments")}
                        </h4>

                        {/* Image Gallery */}
                        {currentLesson.images &&
                          currentLesson.images.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-2 text-sm font-medium text-text">
                                {t("courses.images", "Images")}
                              </h5>
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                {currentLesson.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Lesson image ${idx + 1}`}
                                    className="object-cover w-full h-32 rounded cursor-pointer"
                                    style={{
                                      width: "100%",
                                      height: "128px",
                                      objectFit: "cover",
                                    }}
                                    onClick={() => {
                                      setSelectedImage(img);
                                      setShowImagePopup(true);
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                        {/* File Gallery */}
                        {currentLesson.files &&
                          currentLesson.files.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-2 text-sm font-medium text-text">
                                {t("courses.files", "Files")}
                              </h5>
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                {currentLesson.files.map((file, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleFileClick(file)}
                                    className="flex flex-col items-center p-3 transition-colors border rounded hover:bg-accent"
                                  >
                                    <FaFileAlt className="mb-2 text-2xl text-primary" />
                                    <span className="text-xs text-center text-text">
                                      {t("courses.file", "File")} {idx + 1}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Additional Videos */}
                        {currentLesson.video_related && (
                          <div className="mb-4">
                            <h5 className="mb-2 text-sm font-medium text-text">
                              {t(
                                "courses.additionalVideos",
                                "Additional Videos"
                              )}
                            </h5>
                            <div className="grid grid-cols-1 gap-3">
                              {getVideoRelatedArray(
                                currentLesson.video_related
                              ).map((video, idx) => {
                                const isObj =
                                  typeof video === "object" && video !== null;
                                const videoUrl = isObj
                                  ? video.url || video.src || video.video || ""
                                  : video;
                                const thumbnail = isObj
                                  ? video.thumbnail ||
                                    video.poster ||
                                    video.image ||
                                    ""
                                  : "";
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 transition-all border rounded-lg cursor-pointer group hover:bg-accent hover:border-primary/50"
                                    onClick={() => handleVideoClick(video)}
                                  >
                                    <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                                      {thumbnail ? (
                                        <img
                                          src={thumbnail}
                                          alt={`Additional video ${idx + 1}`}
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <video
                                          src={videoUrl}
                                          className="object-cover w-full h-full"
                                          muted
                                          playsInline
                                          preload="metadata"
                                        />
                                      )}
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full bg-opacity-90">
                                          <FaPlay className="text-gray-700 text-xs ml-0.5" />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FaVideo className="text-sm text-primary" />
                                        <span className="text-sm font-medium text-text">
                                          {t(
                                            "courses.additionalVideo",
                                            "Additional Video"
                                          )}{" "}
                                          {idx + 1}
                                        </span>
                                      </div>
                                      <p className="text-xs text-text-muted">
                                        {t(
                                          "courses.clickToWatch",
                                          "Click to watch this video"
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Periodic Quizzes */}
                        <PeriodicQuizzesSection lesson={currentLesson} />

                        {/* Lesson-End Tests */}
                        <LessonEndTestsSection lesson={currentLesson} />
                      </div>
                    ) : (
                      /* إذا لم يكن هناك مرفقات، نعرض فقط الاختبارات إذا كانت موجودة */
                      <>
                        <PeriodicQuizzesSection lesson={currentLesson} />
                        <LessonEndTestsSection lesson={currentLesson} />
                      </>
                    )}

                    {/* Ask the Instructor */}
                    {course.instructor && course.instructor.whatsapp && (
                      <div className="p-3 mt-4 border rounded-lg bg-surface border-border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900">
                            <FaWhatsapp className="text-lg text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-text">
                              {t("courses.askInstructor", "Ask the Instructor")}
                            </h4>
                            <a
                              href={`https://wa.me/${course.instructor.whatsapp.replace(
                                /[^0-9]/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:text-green-700"
                            >
                              {t(
                                "courses.contactInstructor",
                                "Contact Instructor"
                              )}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentSection ? (
                <div>
                  <div className="aspect-video">
                    {currentSection.video ? (
                      <video
                        src={currentSection.video}
                        controls
                        className="w-full h-full"
                        poster={currentSection.images?.[0]}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-accent">
                        <div className="text-center">
                          <FaVideo className="mx-auto mb-2 text-4xl text-text-muted" />
                          <p className="text-text-muted">
                            {t(
                              "courses.videoNotAvailable",
                              "Video not available"
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text">
                      {currentSection.title}
                    </h3>
                    {currentSection.description && (
                      <div className="mt-2 text-sm text-text-secondary">
                        <p className="leading-relaxed line-clamp-3">
                          {currentSection.description}
                        </p>
                      </div>
                    )}

                    {/* Section Attachments */}
                    {(currentSection.images &&
                      currentSection.images.length > 0) ||
                    (currentSection.files && currentSection.files.length > 0) ||
                    (currentSection.video_related &&
                      currentSection.video_related) ? (
                      <div className="mt-4">
                        <h4 className="mb-3 font-semibold text-md text-text">
                          {t(
                            "courses.sectionAttachments",
                            "Section Attachments"
                          )}
                        </h4>

                        {/* Image Gallery */}
                        {currentSection.images &&
                          currentSection.images.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-2 text-sm font-medium text-text">
                                {t("courses.images", "Images")}
                              </h5>
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                {currentSection.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Section image ${idx + 1}`}
                                    className="object-cover w-full h-32 rounded cursor-pointer"
                                    style={{
                                      width: "100%",
                                      height: "128px",
                                      objectFit: "cover",
                                    }}
                                    onClick={() => {
                                      setSelectedImage(img);
                                      setShowImagePopup(true);
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                        {/* File Gallery */}
                        {currentSection.files &&
                          currentSection.files.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-2 text-sm font-medium text-text">
                                {t("courses.files", "Files")}
                              </h5>
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                {currentSection.files.map((file, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      handleFileClick(file.url || file)
                                    }
                                    className="flex flex-col items-center p-3 transition-colors border rounded hover:bg-accent"
                                  >
                                    <FaFileAlt className="mb-2 text-2xl text-primary" />
                                    <span className="text-xs text-center text-text">
                                      {file.name ||
                                        `${t("courses.file", "File")} ${
                                          idx + 1
                                        }`}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Additional Videos */}
                        {currentSection.video_related && (
                          <div className="mb-4">
                            <h5 className="mb-2 text-sm font-medium text-text">
                              {t(
                                "courses.additionalVideos",
                                "Additional Videos"
                              )}
                            </h5>
                            <div className="grid grid-cols-1 gap-3">
                              {getVideoRelatedArray(
                                currentSection.video_related
                              ).map((video, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 p-4 transition-all border rounded-lg cursor-pointer group hover:bg-accent hover:border-primary/50"
                                  onClick={() => handleVideoClick(video)}
                                >
                                  <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                                    <video
                                      src={video}
                                      className="object-cover w-full h-full"
                                      muted
                                      playsInline
                                      preload="metadata"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full bg-opacity-90">
                                        <FaPlay className="text-gray-700 text-xs ml-0.5" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FaVideo className="text-sm text-primary" />
                                      <span className="text-sm font-medium text-text">
                                        {t(
                                          "courses.additionalVideo",
                                          "Additional Video"
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-xs text-text-muted">
                                      {t(
                                        "courses.clickToWatch",
                                        "Click to watch this video"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section Tests */}
                        <SectionTestsSection section={currentSection} />
                      </div>
                    ) : (
                      /* إذا لم يكن هناك مرفقات، نعرض فقط الاختبارات إذا كانت موجودة */
                      <SectionTestsSection section={currentSection} />
                    )}

                    {/* Section Lessons Preview */}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-accent aspect-video">
                  <div className="text-center">
                    <FaList className="mx-auto mb-4 text-6xl text-text-muted" />
                    <p className="text-text-muted">
                      {t(
                        "courses.selectContent",
                        "Select a lesson or section to start"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructor Card */}
            {course.instructor && (
              <div className="p-6 border rounded-lg bg-surface border-border">
                <h3 className="mb-4 text-lg font-semibold text-text">
                  {t("courses.instructor", "Instructor")}
                </h3>

                <div className="flex items-start gap-4">
                  <img
                    src={
                      course.instructor.image || "/placeholder-instructor.jpg"
                    }
                    alt={course.instructor.name}
                    className="object-cover w-16 h-16 border-2 rounded-full border-primary"
                  />

                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-text">
                      {course.instructor.name}
                    </h4>
                    <p className="mb-2 font-medium text-primary">
                      {course.instructor.job_title}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <FaGraduationCap />
                        <span>
                          {course.instructor.years_of_experience}{" "}
                          {t("courses.yearsExp", "years experience")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaStarSolid className="text-yellow-400" />
                        <span>
                          {(course.instructor.average_rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-text line-clamp-3">
                      {course.instructor.bio}
                    </p>

                    {/* View Details Button */}
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

            {/* Final Tests Section - تم إزالته من هنا ووضعه في الجانب الأيمن فقط */}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md border rounded-lg shadow-xl bg-surface border-border">
            <div className="p-6">
              <div className="mb-6 text-center">
                <FaShoppingCart className="mx-auto mb-4 text-4xl text-primary" />
                <h3 className="mb-2 text-2xl font-semibold text-text">
                  {t("courses.unlockPremium", "Unlock Premium Content")}
                </h3>
                <p className="text-text-muted">
                  {t(
                    "courses.purchaseToAccess",
                    "Purchase this course to access all premium lessons and materials"
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/live-courses/${id}/subscribe`}
                  className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                >
                  <FaShoppingCart />
                  {t("courses.purchaseNow", "Purchase Now")}
                </Link>
                <button
                  onClick={closePurchaseModal}
                  className="w-full px-6 py-3 transition-colors bg-gray-200 rounded-lg text-text hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {t("common.cancel", "Cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup */}
      <ImagePopup />

      {/* PDF Popup */}
      <PDFPopup />

      {/* Video Popup */}
      <VideoPopup />
    </section>
  );
}
