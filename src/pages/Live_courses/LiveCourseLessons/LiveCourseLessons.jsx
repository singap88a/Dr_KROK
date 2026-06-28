// LiveCourseLessons/LiveCourseLessons.jsx - الملف الرئيسي بعد التقسيم
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../context/UserContext";
import i18n from "../../../i18n";
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import { FaCertificate } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Import Shared Components
import CourseHeader from "../../../components/Courses/CourseHeader";
import VideoPlayerSection from "../../../components/Courses/VideoPlayerSection";
import { QuizModal } from "../../../components/Courses/QuizSystem/QuizModal";
import { ResultsModal } from "../../../components/Courses/QuizSystem/ResultsModal";
import { useLessonProgress } from "../../../components/Courses/ProgressSystem/LessonProgress";

// Import Components Local
import Sidebar from "./Sidebar";

// Import Shared Info Cards
import BatchInfoCard from "../../../components/Courses/InfoCards/BatchInfoCard";
import InstructorCard from "../../../components/Courses/InfoCards/InstructorCard";

// Import Modals
import PurchaseModal from "../../../components/Courses/ContentModals/PurchaseModal";
import ImagePopup from "../../../components/Courses/ContentModals/ImagePopup";
import PDFPopup from "../../../components/Courses/ContentModals/PDFPopup";
import VideoPopup from "../../../components/Courses/ContentModals/VideoPopup";

// Import Utils
import { formatSessionTimeRaw, formatSessionTime, isLinkActive, getTimeUntilStart } from "./timeUtils.jsx";

dayjs.extend(utc);
dayjs.extend(timezone);

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
  const { isLoggedIn, user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [sections, setSections] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());

  // Quiz States
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

  // Progress Hooks
  const { calculateTotalProgress, calculateSectionProgress: calcSectionProgress } = useLessonProgress();

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper Functions
  const getPeriodicQuizzes = () => {
    if (!currentLesson || !currentLesson.lesson_end_tests) return [];
    return currentLesson.lesson_end_tests.filter(
      (test) => test.test_type === "Periodic Quiz (Live Session)"
    );
  };

  const saveLastLesson = useCallback((courseId, lessonId) => {
    if (courseId && lessonId) {
      const storageKey = `last_live_lesson_${courseId}`;
      localStorage.setItem(storageKey, lessonId.toString());
    }
  }, []);

  const getLastLesson = useCallback((courseId) => {
    if (!courseId) return null;
    const storageKey = `last_live_lesson_${courseId}`;
    return localStorage.getItem(storageKey);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLessonClickWithClose = (lesson) => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    handleLessonClick(lesson);
  };

  const handleSectionClickWithClose = (section) => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    handleSectionClick(section);
  };

  const handleVideoTimeUpdate = (e) => {
    const time = Math.floor(e.target.currentTime);
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
      e.target.pause();
      setProcessedQuizzes((prev) => new Set([...prev, foundQuiz.id]));
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

  const handleVideoEnd = async () => {
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
          if (result && result.isCorrect) {
            correctAnswers++;
            totalScore += result.score;
          }
        });
      });

      if (totalQuestions > 0) {
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

    if (isLoggedIn && currentLesson) {
      try {
        const currentStatus = lessonStatuses[currentLesson.id] || {};
        const hasTests = currentLesson.lesson_end_tests && currentLesson.lesson_end_tests.length > 0;
        let newPercentage = 100;

        if (hasTests) {
          const quizCompleted = currentStatus.quiz_percentage >= 100;
          newPercentage = quizCompleted ? 100 : 50;
        }

        setLessonStatuses((prev) => ({
          ...prev,
          [currentLesson.id]: {
            ...prev[currentLesson.id],
            lesson_percentage: 100,
            percentage: newPercentage,
            status: newPercentage === 100 ? "completed" : "in_progress",
          },
        }));

        const res = await completeLiveLessonProgress(id, currentLesson.id, "lesson");
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
        await updateLessonStatus(currentLesson.id);
      } catch {
        // Handle error silently
      }
    }
  };

  const updateLessonStatus = useCallback(
    async (lessonId) => {
      if (!isLoggedIn || !course?.id) return;
      const realId = course.id;
      try {
        const [updatedCourseProgress, updatedLessonProgress] = await Promise.all([
          getLiveCourseProgressDetails(realId),
          getLiveLessonProgress(realId, lessonId),
        ]);

        if (updatedCourseProgress) {
          setCourseProgress(updatedCourseProgress);
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
    [isLoggedIn, course?.id, getLiveCourseProgressDetails, getLiveLessonProgress]
  );

  const handleLessonComplete = async (lessonId) => {
    let lesson = null;
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

    const hasVideo = !!lesson.video;
    const hasTests = lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;

    let newPercentage = 100;
    let lessonPercentage = 100;
    let quizPercentage = 0;

    if (hasVideo && hasTests) {
      const currentStatus = lessonStatuses[lessonId] || {};
      const quizCompleted = currentStatus.quiz_percentage >= 100;
      newPercentage = quizCompleted ? 100 : 50;
      lessonPercentage = 100;
      quizPercentage = quizCompleted ? 100 : currentStatus.quiz_percentage || 0;
    } else if (hasVideo && !hasTests) {
      newPercentage = 100;
      lessonPercentage = 100;
    } else if (hasTests && !hasVideo) {
      newPercentage = 100;
      quizPercentage = 100;
    }

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

    if (!course?.id) return;
    const realId = course.id;

    try {
      const response = await completeLiveLessonProgress(realId, lessonId, "lesson");
      if (response.success) {
        if (response.data && response.data.lesson) {
          setLessonStatuses((prev) => ({
            ...prev,
            [lessonId]: {
              ...prev[lessonId],
              ...response.data.lesson,
            },
          }));
        }

        const updatedProgress = await getLiveCourseProgressDetails(realId);
        if (updatedProgress) {
          setCourseProgress(updatedProgress);
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
      await updateLessonStatus(lessonId);
    }
  };

  const calculateSectionProgress = useCallback(
    (sectionId) => {
      return calcSectionProgress(sectionId, sections, lessonStatuses, calculateTotalProgress);
    },
    [sections, lessonStatuses, calculateTotalProgress, calcSectionProgress]
  );

  const handleLessonClick = async (lesson) => {
    const isFree = lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true;

    if (!isFree && !hasAccess) {
      if (!isLoggedIn) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      setShowPurchaseModal(true);
      return;
    }

    setCurrentLesson(lesson);
    setCurrentSection(null);

    if (!course?.id) return;
    const realId = course.id;

    saveLastLesson(realId, lesson.id);

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const videoSection = document.getElementById("video-player-section");
        if (videoSection) {
          videoSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }

    if (isLoggedIn) {
      try {
        const res = await startLiveLessonProgress(realId, lesson.id);
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
    const hasFreeLessons = (sectionId) => {
      const sectionData = sections.find((s) => s.id === sectionId);
      if (!sectionData) return false;
      if (sectionData.type === "free" || sectionData.type === "Free") return true;
      if (!sectionData.lessons) return false;
      return sectionData.lessons.some((lesson) =>
        lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
      );
    };

    const isFree = section.type === "free" || section.type === "Free" || hasFreeLessons(section.id);
    if (!isFree && !hasAccess) {
      if (!isLoggedIn) {
        navigate("/login", { state: { from: location.pathname } });
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

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const courseData = await getLiveCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(courseData);

        const realId = courseData.id;

        if (courseData.server_time) {
          const serverTime = new Date(courseData.server_time).getTime();
          const localTime = Date.now();
          const offset = serverTime - localTime;
          setServerTimeOffset(offset);
        }
        setLessons(courseData.lessons || []);
        setSections(courseData.sections || []);

        setExpandedSections(new Set());

        const lastLessonId = getLastLesson(realId);
        let targetLesson = null;
        let targetSection = null;

        if (lastLessonId && courseData.sections) {
          for (const section of courseData.sections) {
            if (section.lessons) {
              const foundLesson = section.lessons.find(lesson => lesson.id.toString() === lastLessonId);
              if (foundLesson) {
                targetLesson = foundLesson;
                targetSection = section;
                setExpandedSections(prev => new Set(prev).add(section.id));
                break;
              }
            }
          }
        }

        if (!targetLesson && courseData.sections && courseData.sections.length > 0) {
          const firstSectionWithFree = courseData.sections.find(section =>
            section.type === "free" || section.type === "Free" ||
            (section.lessons && section.lessons.some(lesson =>
              lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
            ))
          );

          if (firstSectionWithFree) {
            setExpandedSections(prev => new Set(prev).add(firstSectionWithFree.id));
            const firstFreeLesson = firstSectionWithFree.lessons.find(lesson =>
              lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
            );
            if (firstFreeLesson) {
              targetLesson = firstFreeLesson;
              targetSection = firstSectionWithFree;
            }
          }
        }

        if (!targetLesson && courseData.sections && courseData.sections.length > 0) {
          const firstSection = courseData.sections[0];
          if (firstSection.lessons && firstSection.lessons.length > 0) {
            targetLesson = firstSection.lessons[0];
            targetSection = firstSection;
            setExpandedSections(prev => new Set(prev).add(firstSection.id));
          }
        }

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

        if (isLoggedIn) {
          try {
            const courseProgressDetails = await getLiveCourseProgressDetails(realId);
            if (courseProgressDetails) {
              setCourseProgress(courseProgressDetails);
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

                const sectionProgressData = {};
                courseProgressDetails.sections_progress.forEach((section) => {
                  sectionProgressData[section.section_id] = section.progress;
                });
                setSectionProgress(sectionProgressData);
              }
              setLessonStatuses(updatedStatuses);
            }
          } catch {
            try {
              const oldProgress = await getLiveCourseProgress(realId);
              setCourseProgress(oldProgress);
            } catch {
              // ignore
            }
          }
        }

        // Check course access and expiration
        if (courseData.enrollment_status) {
          const { is_enrolled, is_expired: expired } = courseData.enrollment_status;
          setIsExpired(expired === true);
          setHasAccess(is_enrolled === true && expired === false);
        } else if (isLoggedIn) {
          try {
            const access = await getCourseAccess(realId, 'live_course');
            if (access && typeof access === 'object') {
              const enrolled = access.is_enrolled === true;
              const expired = access.is_expired === true;
              setIsExpired(expired);
              setHasAccess(enrolled && !expired);
            } else {
              setIsExpired(false);
              setHasAccess(!!access);
            }
          } catch {
            setIsExpired(false);
            setHasAccess(courseData.price === 0 || courseData.price === "0");
          }
        } else {
          setIsExpired(false);
          setHasAccess(false);
        }

        if (targetLesson) {
          setCurrentLesson(targetLesson);
          if (isLoggedIn) {
            try {
              const res = await startLiveLessonProgress(realId, targetLesson.id);
              if (res?.course_progress) setCourseProgress(res.course_progress);
              if (res?.lesson) {
                setLessonStatuses((prev) => ({
                  ...prev,
                  [targetLesson.id]: {
                    ...prev[targetLesson.id],
                    ...res.lesson,
                  },
                }));
              }
            } catch {
              /* noop */
            }
          }
          saveLastLesson(realId, targetLesson.id);
        } else if (targetSection) {
          setCurrentSection(targetSection);
        } else if (courseData.sections && courseData.sections.length > 0) {
          setCurrentSection(courseData.sections[0]);
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
  }, [id, getLiveCourseById, getCourseAccess, getLiveCourseProgress, getLiveCourseProgressDetails, startLiveLessonProgress, getLiveLessonProgress, isLoggedIn, updateLessonStatus, getLastLesson, saveLastLesson]);

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
  }, [location.state, id, isLoggedIn, getLiveCourseProgressDetails, updateLessonStatus]);

  useEffect(() => {
    setProcessedQuizzes(new Set());
    setAnsweredQuizzes(new Set());
    setQuizResults({});
  }, [currentLesson?.id]);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, [loading]);

  const sortedSections = useMemo(() => sections, [sections]);

  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;
      if (section.type === "free" || section.type === "Free") return true;
      if (!section.lessons) return false;
      return section.lessons.some((lesson) =>
        lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
      );
    };
  }, [sections]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-text">
        <div className="text-red-600">
          {t("common.error", "Error")}: {error || t("courses.courseNotFound", "Course not found.")}
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

        <CourseHeader
          course={course}
          hasAccess={hasAccess}
          isLoggedIn={isLoggedIn}
          courseProgress={courseProgress}
          progressLoading={progressLoading}
          onPurchaseClick={() => setShowPurchaseModal(true)}
          backPath={`/live-courses/${course.id}`}
        />

        <BatchInfoCard course={course} t={t} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {isExpired ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              <div className="flex flex-col items-center justify-center p-8 my-8 text-center border shadow-xl bg-surface rounded-3xl border-border sm:p-12 sm:my-12">
                <div className="flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full dark:bg-green-900/30 sm:w-24 sm:h-24">
                  <FaCertificate className="text-4xl text-green-600 dark:text-green-400 sm:text-5xl" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  {t("courses.courseCompletedTitle", "تم اجتياز الدورة بنجاح!")}
                </h2>
                <p className="max-w-md mx-auto mb-8 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                  {t("courses.courseCompletedMessage", "لقد أتممت متطلبات هذه الدورة بنجاح في وقت سابق. نظراً لانتهاء فترة صلاحية الوصول، لا يمكن عرض المحتوى حالياً. نتمنى لك دوام التوفيق والنجاح.")}
                </p>
                <Link
                  to={`/live-courses/${id}`}
                  className="px-6 py-3 font-semibold text-white transition-all sm:px-8 bg-primary rounded-xl hover:bg-secondary hover:scale-105"
                >
                  {t("courses.backToDetails", "العودة لتفاصيل الدورة")}
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <Sidebar
                sections={sortedSections}
                expandedSections={expandedSections}
                currentSection={currentSection}
                currentLesson={currentLesson}
                lessonStatuses={lessonStatuses}
                sectionProgress={sectionProgress}
                hasAccess={hasAccess}
                isLoggedIn={isLoggedIn}
                course={course}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
                onSectionClick={handleSectionClickWithClose}
                onLessonClick={handleLessonClickWithClose}
                onToggleSection={(sectionId) => {
                  setExpandedSections((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(sectionId)) newSet.delete(sectionId);
                    else newSet.add(sectionId);
                    return newSet;
                  });
                }}
                hasFreeLessons={hasFreeLessons}
                calculateTotalProgress={calculateTotalProgress}
                calculateSectionProgress={calculateSectionProgress}
                id={id}
                courseProgress={courseProgress}
                navigate={navigate}
                t={t}
              />

              <div id="video-player-section" className="space-y-6 lg:col-span-2">
              <VideoPlayerSection
                currentLesson={currentLesson}
                currentSection={currentSection}
                hasAccess={hasAccess}
                isLoggedIn={isLoggedIn}
                course={course}
                id={id}
                lessonStatuses={lessonStatuses}
                quizModal={quizModal}
                setQuizModal={setQuizModal}
                resultsModal={resultsModal}
                setResultsModal={setResultsModal}
                setAnsweredQuizzes={setAnsweredQuizzes}
                setQuizResults={setQuizResults}
                onVideoTimeUpdate={handleVideoTimeUpdate}
                onVideoEnd={handleVideoEnd}
                onLessonComplete={handleLessonComplete}
                onFileClick={handleFileClick}
                onVideoClick={handleVideoClick}
                onImageClick={(image) => {
                  setSelectedImage(image);
                  setShowImagePopup(true);
                }}
                serverTimeOffset={serverTimeOffset}
                currentTimeMs={currentTimeMs}
                isDescriptionExpanded={isDescriptionExpanded}
                setIsDescriptionExpanded={setIsDescriptionExpanded}
                hasFreeLessons={hasFreeLessons}
                formatSessionTimeRaw={formatSessionTimeRaw}
                isLinkActive={isLinkActive}
                getTimeUntilStart={getTimeUntilStart}
                setShowPurchaseModal={setShowPurchaseModal}
                isLiveCourse={true}
                groupId={
                  course?.batch_info?.batch_id ??
                  course?.id ??
                  course?.group_id ??
                  course?.batch?.id ??
                  course?.batch_id ??
                  course?.group?.id ??
                  null
                }
              />
              </div>
            </>
          )}
        </div>
      </div>

      <PurchaseModal
        show={showPurchaseModal}
        onClose={closePurchaseModal}
        courseId={id}
        isLive={true}
      />

      <ImagePopup
        showImagePopup={showImagePopup}
        selectedImage={selectedImage}
        setShowImagePopup={setShowImagePopup}
      />

      <PDFPopup
        showFilesPopup={showFilesPopup}
        selectedFile={selectedFile}
        setShowFilesPopup={setShowFilesPopup}
      />

      <VideoPopup
        showVideoPopup={showVideoPopup}
        selectedVideo={selectedVideo}
        setShowVideoPopup={setShowVideoPopup}
      />
    </section>
  );
}