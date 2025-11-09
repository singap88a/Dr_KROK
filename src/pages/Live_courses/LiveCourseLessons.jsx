// LiveCourseLessons.jsx - الملف الرئيسي بعد التقسيم
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import i18n from "../../i18n";
import LoadingSpinner from "../../components/LoadingSpinner";
import SectionItem from "../Courses/SectionItem";

// Import Components
import { useLessonProgress } from "./ProgressSystem/LessonProgress";
import { QuizModal } from "./QuizSystem/QuizModal";
import { ResultsModal } from "./QuizSystem/ResultsModal";
import { LessonEndTestsSection } from "./QuizSystem/LessonEndTests";
import { PeriodicQuizzesSection } from "./QuizSystem/PeriodicQuizzes";
import { FinalTestsSection } from "./QuizSystem/FinalTests";
import { ImagePopup } from "./ContentModals/ImagePopup";
import { PDFPopup } from "./ContentModals/PDFPopup";
import { VideoPopup } from "./ContentModals/VideoPopup";
import { VideoPlayer } from "./LessonPlayer/VideoPlayer";
import { LessonAttachments } from "./LessonPlayer/LessonAttachments";
import { CertificateSection } from "./CertificateSection/CertificateSection";

// Icons
import {
  FaPlay,
  FaLock,
  FaCheck,
  FaClock,
  FaBookOpen,
  FaArrowLeft,
  FaVideo,
  FaFileAlt,
  FaImage,
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
  FaList,
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

  // Helper Functions
  const getPeriodicQuizzes = () => {
    if (!currentLesson || !currentLesson.lesson_end_tests) return [];
    return currentLesson.lesson_end_tests.filter(
      (test) => test.test_type === "Periodic Quiz (Live Session)"
    );
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
      if (!isLoggedIn) return;
      try {
        const [updatedCourseProgress, updatedLessonProgress] = await Promise.all([
          getLiveCourseProgressDetails(id),
          getLiveLessonProgress(id, lessonId),
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
    [isLoggedIn, id, getLiveCourseProgressDetails, getLiveLessonProgress]
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

    try {
      const response = await completeLiveLessonProgress(id, lessonId, "lesson");
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

        const updatedProgress = await getLiveCourseProgressDetails(id);
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

  // Data Loading
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const courseData = await getLiveCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(courseData);
        setLessons(courseData.lessons || []);
        setSections(courseData.sections || []);

        // Expand all sections to show all lessons including locked ones
        const allSectionIds = new Set();
        if (courseData.sections) {
          courseData.sections.forEach((section) => {
            allSectionIds.add(section.id);
          });
        }
        setExpandedSections(allSectionIds);

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
            const courseProgressDetails = await getLiveCourseProgressDetails(id);
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

        if (isLoggedIn) {
          try {
            const access = await getCourseAccess(id, 'live_course');
            setHasAccess(access);
          } catch {
            setHasAccess(courseData.price === 0 || courseData.price === "0");
          }
        } else {
          setHasAccess(false);
        }

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
                section.lessons.some((lesson) => lesson.type === "free" || lesson.type === "Free")
            );
            if (firstSectionWithFree) {
              firstFreeContent = { type: "section", data: firstSectionWithFree };
            }
          }

          if (!firstFreeContent && courseData.sections[0]) {
            firstFreeContent = { type: "section", data: courseData.sections[0] };
          }

          if (firstFreeContent) {
            if (firstFreeContent.type === "lesson") {
              setCurrentLesson(firstFreeContent.data);
              if (isLoggedIn) {
                try {
                  const res = await startLiveLessonProgress(id, firstFreeContent.data.id);
                  if (res?.course_progress) setCourseProgress(res.course_progress);
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
                const res = await startLiveLessonProgress(id, firstFreeLesson.id);
                if (res?.course_progress) setCourseProgress(res.course_progress);
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

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [sections]);

const getSectionLessons = useMemo(() => {
  return (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.lessons) return [];
    
    const sectionLessons = [...section.lessons].sort((a, b) => {
      const aFree = a.type === "free" || a.type === "Free" || a.is_free === true;
      const bFree = b.type === "free" || b.type === "Free" || b.is_free === true;
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
      return (a.id || 0) - (b.id || 0);
    });

    return sectionLessons;
  };
}, [sections]);

const hasFreeLessons = useMemo(() => {
  return (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.lessons) return false;
    return section.lessons.some((lesson) => 
      lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
    );
  };
}, [sections]);

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

const handleLessonClick = async (lesson) => {
  const isFree = lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true;
  
  // If lesson is not free and user doesn't have access
  if (!isFree && !hasAccess) {
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
  // If no free lessons in section and user doesn't have access
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

  // Helper: format session start time like "02 Nov 2025 - 06:43 PM"
  const formatSessionTime = (dateString) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString.replace(" ", "T"));
      const day = d.getDate().toString().padStart(2, "0");
      const month = d.toLocaleString(undefined, { month: "short" });
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const hourStr = hours.toString().padStart(2, "0");
      return `${day} ${month} ${year} - ${hourStr}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

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
                    {course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0} {t("courses.lessons", "Lessons")}
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <FaUsers className="text-primary" />
                  <span>
                    {course.enrolled_count || 0} {t("courses.students", "Students")}
                  </span>
                </div> */}
                {isLoggedIn && (
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary" />
                    <span>
                      {t("courses.progress", "Progress")}:{" "}
                      {progressLoading ? "..." : `${Math.round(courseProgress?.overall?.percentage || 0)}%`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(course.avg_rating || 0)}
                  </div>
                  <span className="text-sm">
                    {(course.avg_rating || 0).toFixed(1)} ({course.ratings_count || 0})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(course.level)}`}
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
                        Math.round(courseProgress?.overall?.percentage || 0) === 100
                          ? "bg-green-500"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Math.round(courseProgress?.overall?.percentage || 0))
                        )}%`,
                      }}
                    />
                  </div>
                  {Math.round(courseProgress?.overall?.percentage || 0) === 100 && (
                    <div className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-green-700 bg-green-100 rounded">
                      {t("courses.completed", "Completed")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    $
                    {(
                      Number(course.discount) > 0
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
                        {Math.round((Number(course.discount) / Number(course.price)) * 100)}%
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

{/* Batch Info */}
{course?.batch_info && (
  <div className="p-6 mb-6 transition-all duration-300 border shadow-sm rounded-xl bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-primary/20 hover:shadow-md">
    <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg shadow-sm bg-gradient-to-r from-primary/20 to-secondary/20">
          <FaUsers className="text-lg text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">Batch Information</h3>
          <p className="text-sm text-text-muted">Details about your course batch</p>
        </div>
      </div>
      {course.batch_info.telegram_link && (
        <a
          href={course.batch_info.telegram_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <FaTelegram className="text-base" />
          Join Telegram Group
        </a>
      )}
    </div>
    
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5">
        <div className="p-2 rounded-md bg-primary/10">
          <FaGraduationCap className="text-primary" />
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-medium tracking-wide uppercase text-text-muted">Batch Name</div>
          <div className="font-semibold truncate text-text">{course.batch_info.batch_name}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5">
        <div className="p-2 rounded-md bg-primary/10">
          <FaUsers className="text-primary" />
        </div>
        <div>
          <div className="text-xs font-medium tracking-wide uppercase text-text-muted">Students</div>
          <div className="font-semibold text-text">{course.batch_info.students_count}</div>
        </div>
      </div>
      
      {course.batch_info.status && (
        <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5">
          <div className="p-2 rounded-md bg-primary/10">
            <FaClock className="text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium tracking-wide uppercase text-text-muted">Status</div>
            <div className="flex items-center gap-1 font-semibold text-text">
              <span className={`inline-block w-2 h-2 rounded-full ${course.batch_info.status === 'Active' ? 'bg-green-500' : course.batch_info.status === 'Completed' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
              {course.batch_info.status}
            </div>
          </div>
        </div>
      )}
      
      {course.batch_info.instructor && (
        <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5">
          <div className="p-2 rounded-md bg-primary/10">
            <FaUser className="text-primary" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-medium tracking-wide uppercase text-text-muted">Instructor</div>
          <div className="font-semibold truncate text-text">{course.batch_info.instructor?.name || 'Unknown Instructor'}</div>
          </div>
        </div>
      )}
    </div>
    
    {/* Additional Info Section */}
    <div className="pt-4 mt-4 border-t border-primary/10">
      <div className="flex flex-wrap gap-2">
        {course.batch_info.start_date && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-primary/5 text-primary border border-primary/10">
            <FaCalendarAlt className="text-xs" />
            <span>Starts: {course.batch_info.start_date}</span>
          </div>
        )}
        {course.batch_info.duration && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-secondary/5 text-secondary border border-secondary/10">
            <FaHourglassHalf className="text-xs" />
            <span>Duration: {course.batch_info.duration}</span>
          </div>
        )}
        {course.batch_info.language && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-green-500/5 text-green-600 border border-green-500/10">
            <FaLanguage className="text-xs" />
            <span>Language: {course.batch_info.language}</span>
          </div>
        )}
      </div>
    </div>
  </div>
)}


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
    hasAccess={hasAccess}
  />
))}

              {/* Final Tests */}
              <FinalTestsSection course={course} courseProgress={courseProgress} id={id} />

              {/* Certificate Section */}
              <CertificateSection id={id} isLoggedIn={isLoggedIn} />
            </div>
          </div>

          {/* Video Player & Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Player */}
            <div className="overflow-hidden border rounded-lg bg-surface border-border">
              {currentLesson || currentSection ? (
                <div className="relative">
                  {currentLesson && currentLesson.status === "active" ? (
                    // Active status - show ALL content normally
                    <>
                      <div className="relative aspect-video">
                        <VideoPlayer
                          currentLesson={currentLesson}
                          currentSection={currentSection}
                          handleVideoTimeUpdate={handleVideoTimeUpdate}
                          handleVideoEnd={handleVideoEnd}
                        />

                        {/* Quiz Modals */}
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
                                handleLessonComplete(currentLesson.id);
                              }}
                              className="px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-secondary"
                            >
                              {t("courses.markCompleted", "Mark as Completed")}
                            </button>
                          </div>
                        )}

                        {/* Session description */}
                        {currentLesson?.description && (
                          <div className="mt-3 text-sm text-text-secondary">
                            <p className="leading-relaxed">
                              {currentLesson.description}
                            </p>
                          </div>
                        )}

                        {/* Session start time - ALWAYS show if available */}
                        {currentLesson?.started_at && (
                          <div className="flex items-center gap-2 p-3 mt-3 text-sm border rounded bg-surface-2 border-border-2">
                            <FaCalendarAlt className="text-primary" />
                            <span className="font-medium">Session Date:</span>
                            <span className="text-text-muted">
                              {formatSessionTime(currentLesson.started_at)}
                            </span>
                          </div>
                        )}

                        {/* Zoom link - ALWAYS show if available */}
                        {currentLesson?.zoom_link && (
                          <div className="mt-3">
                            <a
                              href={currentLesson.zoom_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded bg-primary hover:bg-secondary"
                            >
                              <FaVideo />
                              Join Live Session
                            </a>
                          </div>
                        )}



                        {/* Attachments */}
                        <LessonAttachments
                          content={currentLesson || currentSection}
                          setSelectedImage={setSelectedImage}
                          setShowImagePopup={setShowImagePopup}
                          handleFileClick={handleFileClick}
                          handleVideoClick={handleVideoClick}
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
                    // Inactive status - show professional message
                    <div className="p-8 text-center aspect-video bg-accent">
                      <div className="max-w-lg mx-auto">
                        <div className="mb-4 text-3xl">
                          <FaClock className="mx-auto text-4xl text-yellow-500" />
                        </div>

                        <div className="mb-3 text-lg font-semibold text-text">
                          Session is Currently Inactive
                        </div>

                        {/* ALWAYS show session date if available */}
                        {currentLesson?.started_at && (
                          <div className="p-3 mb-4 text-sm border rounded bg-surface-2 border-border-2">
                            <div className="flex items-center justify-center gap-2">
                              <FaCalendarAlt className="text-primary" />
                              <span className="font-medium">Session Date:</span>
                              <span className="text-text-muted">
                                {formatSessionTime(currentLesson.started_at)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ALWAYS show zoom link if available */}
                        {currentLesson?.zoom_link && (
                          <div className="mt-4">
                            <a
                              href={currentLesson.zoom_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded text-primary hover:bg-primary/5"
                            >
                              <FaVideo />
                              View Meeting Link
                            </a>
                          </div>
                        )}

                        <p className="mt-3 text-sm text-text-muted">
                          This session is not currently active. Please check the schedule for updates.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-accent aspect-video">
                  <div className="text-center">
                    <FaList className="mx-auto mb-4 text-6xl text-text-muted" />
                    <p className="text-text-muted">
                      {t("courses.selectContent", "Select a lesson or section to start")}
                    </p>
                    {!hasAccess && (
                      <div className="p-4 mt-4 border border-yellow-300 rounded-lg bg-yellow-50">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <FaLock className="text-yellow-600" />
                          <span className="font-medium">Premium Content Locked</span>
                        </div>
                        <p className="mt-2 text-sm text-yellow-700">
                          You need to enroll in this course to access all premium lessons and materials.
                        </p>
                        <button
                          onClick={() => setShowPurchaseModal(true)}
                          className="px-4 py-2 mt-3 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                        >
                          Enroll Now to Unlock
                        </button>
                      </div>
                    )}
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
                    src={course.instructor.image || "/placeholder-instructor.jpg"}
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
                          {course.instructor.years_of_experience} {t("courses.yearsExp", "years experience")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaStarSolid className="text-yellow-400" />
                        <span>{(course.instructor.average_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-text line-clamp-3">
                      {course.instructor.bio}
                    </p>

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
                  {t("courses.purchaseToAccess", "Purchase this course to access all premium lessons and materials")}
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

      {/* Content Modals */}
      <ImagePopup
        showImagePopup={showImagePopup}
        setShowImagePopup={setShowImagePopup}
        selectedImage={selectedImage}
      />

      <PDFPopup
        showFilesPopup={showFilesPopup}
        setShowFilesPopup={setShowFilesPopup}
        selectedFile={selectedFile}
      />

      <VideoPopup
        showVideoPopup={showVideoPopup}
        setShowVideoPopup={setShowVideoPopup}
        selectedVideo={selectedVideo}
      />
    </section>
  );
}