import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../context/UserContext";
import i18n from "../../../i18n";
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import { FaCertificate } from "react-icons/fa";
// Shared Components
import CourseHeader from "../../../components/Courses/CourseHeader";
import VideoPlayerSection from "../../../components/Courses/VideoPlayerSection";
import { useLessonProgress } from "../../../components/Courses/ProgressSystem/LessonProgress";
import { QuizModal } from "../../../components/Courses/QuizSystem/QuizModal";
import { ResultsModal } from "../../../components/Courses/QuizSystem/ResultsModal";
import ImagePopup from "../../../components/Courses/ContentModals/ImagePopup";
import VideoPopup from "../../../components/Courses/ContentModals/VideoPopup";

// Local Components
import CourseContentSidebar from "./CourseContentSidebar";
import PurchaseModal from "../../../components/Courses/ContentModals/PurchaseModal";
import InstructorCard from "../../../components/Courses/InfoCards/InstructorCard";

export default function CourseLessons() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    getVideoCourseById,
    getCourseAccess,
    getCourseProgress,
    startLessonProgress,
    completeLessonProgress,
    getLessonProgress,
    getCourseProgressDetails,
    markLessonAsCompleted,
  } = useApi();
  const { isLoggedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
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
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [progressLoading] = useState(false);
  const [sectionProgress, setSectionProgress] = useState({});

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
  const [processedTimes, setProcessedTimes] = useState(new Set());

  // Progress Hook
  const { calculateTotalProgress: calcTotalProgress, calculateSectionProgress: calcSectionProgress } = useLessonProgress();

  const calculateTotalProgress = useCallback((lesson, lessonStatus) => {
    return calcTotalProgress(lesson, lessonStatus);
  }, [calcTotalProgress]);

  // 🔥 إضافة دوال حفظ وجلب آخر درس
  const saveLastLesson = useCallback((courseId, lessonId) => {
    if (courseId && lessonId) {
      const storageKey = `last_video_lesson_${courseId}`;
      localStorage.setItem(storageKey, lessonId.toString());
    }
  }, []);

  const getLastLesson = useCallback((courseId) => {
    if (!courseId) return null;
    const storageKey = `last_video_lesson_${courseId}`;
    return localStorage.getItem(storageKey);
  }, []);

  // دالة محسنة لتحديث حالة الدرس
  const updateLessonStatus = useCallback(
    async (lessonId) => {
      if (!isLoggedIn || !course?.id) return;
      const realId = course.id;

      try {
        const [updatedCourseProgress, updatedLessonProgress] =
          await Promise.all([
            getCourseProgressDetails(realId),
            getLessonProgress(realId, lessonId),
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
    [isLoggedIn, course?.id, getCourseProgressDetails, getLessonProgress]
  );

  // دالة محسنة لإكمال الدرس - تحديث فوري للواجهة
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

    if (!lesson) return;

    const hasVideo = !!lesson.video;
    const hasTests =
      lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;
    let newPercentage = 100;

    if (hasVideo && hasTests) {
      const currentStatus = lessonStatuses[lessonId] || {};
      const quizCompleted = currentStatus.quiz_percentage >= 100;
      newPercentage = quizCompleted ? 100 : 50;
    }

    setLessonStatuses((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        percentage: newPercentage,
        status: newPercentage === 100 ? "completed" : "in_progress",
        lesson_percentage: hasVideo ? 100 : prev[lessonId]?.lesson_percentage || 0,
        quiz_percentage:
          hasTests && newPercentage === 100
            ? 100
            : prev[lessonId]?.quiz_percentage || 0,
      },
    }));

    if (!course?.id) return;
    const realId = course.id;

    try {
      const res = await markLessonAsCompleted(realId, lessonId);
      if (res) {
        const updatedProgress = await getCourseProgressDetails(realId);
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

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const courseData = await getVideoCourseById(id, isLoggedIn);
        if (!mounted) return;
        setCourse(courseData);
        setLessons(courseData.lessons || []);
        setSections(courseData.sections || []);

        const realId = courseData.id;

        // 🔥 التعديل الأول: كل السيكشنز مقفولة في البداية
        setExpandedSections(new Set());
        console.log("🔒 All sections locked by default");

        // 🔥 التعديل الثاني: جلب آخر درس من localStorage
        const lastLessonId = getLastLesson(realId);
        let targetLesson = null;
        let targetSection = null;

        if (lastLessonId && courseData.sections) {
          // البحث عن الدرس الأخير في كل السيكشنز
          for (const section of courseData.sections) {
            if (section.lessons) {
              const foundLesson = section.lessons.find(lesson => lesson.id.toString() === lastLessonId);
              if (foundLesson) {
                targetLesson = foundLesson;
                targetSection = section;
                // 🔥 فتح السيكشن اللي فيه الدرس الأخير فقط
                setExpandedSections(prev => new Set(prev).add(section.id));
                console.log(`🎯 Found last lesson: ${foundLesson.title} in section: ${section.title}`);
                break;
              }
            }
          }
        }

        // إذا مفيش آخر درس محفوظ، نفتح أول سيكشن فيه دروس مجانية
        if (!targetLesson && courseData.sections && courseData.sections.length > 0) {
          const firstSectionWithFree = courseData.sections.find(section => 
            section.lessons && section.lessons.some(lesson => 
              lesson.type === "free" || lesson.type === "Free"
            )
          );
          
          if (firstSectionWithFree) {
            setExpandedSections(prev => new Set(prev).add(firstSectionWithFree.id));
            const firstFreeLesson = firstSectionWithFree.lessons.find(lesson => 
              lesson.type === "free" || lesson.type === "Free"
            );
            if (firstFreeLesson) {
              targetLesson = firstFreeLesson;
              targetSection = firstSectionWithFree;
              console.log(`📘 Using first free lesson: ${firstFreeLesson.title}`);
            }
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
            const courseProgressDetails = await getCourseProgressDetails(realId);
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
              const oldProgress = await getCourseProgress(realId);
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
            const access = await getCourseAccess(realId, 'video_course');
            if (access && typeof access === 'object') {
              const enrolled = access.is_enrolled === true;
              const expired  = access.is_expired  === true;
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

        // 🔥 التعديل الثالث: تحديد الدرس الحالي بناءً على الأخير
        if (targetLesson) {
          setCurrentLesson(targetLesson);
          if (isLoggedIn) {
            try {
              const res = await startLessonProgress(realId, targetLesson.id);
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
          // حفظ الدرس الحالي كآخر درس
          saveLastLesson(realId, targetLesson.id);
        } else if (targetSection) {
          setCurrentSection(targetSection);
        } else if (courseData.sections && courseData.sections.length > 0) {
          // إذا مفيش دروس، نعرض أول سيكشن
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
  }, [
    id,
    getVideoCourseById,
    getCourseAccess,
    getCourseProgress,
    getCourseProgressDetails,
    startLessonProgress,
    getLessonProgress,
    isLoggedIn,
    updateLessonStatus,
    getLastLesson,
    saveLastLesson,
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
          const updatedProgress = await getCourseProgressDetails(id);
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
    getCourseProgressDetails,
    updateLessonStatus,
  ],
  );

  useEffect(() => {
    setProcessedQuizzes(new Set());
    setAnsweredQuizzes(new Set());
    setProcessedTimes(new Set());
    setQuizResults({});
  }, [currentLesson?.id]);

  // Reset scroll after content loads to prevent blank viewport on first paint
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, [loading]);

  const getPeriodicQuizzes = () => {
    if (!currentLesson || !currentLesson.lesson_end_tests) return [];
    return currentLesson.lesson_end_tests.filter(
      (test) => test.test_type && test.test_type.includes("Periodic Quiz")
    );
  };

  const handleVideoTimeUpdate = (e) => {
    const time = Math.floor(e.target.currentTime);
    if (processedTimes.has(time)) return;

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
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.warn(err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      setProcessedQuizzes((prev) => new Set([...prev, foundQuiz.id]));
      setProcessedTimes((prev) => new Set([...prev, time]));
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
      handleLessonComplete(currentLesson.id);
    }
  };

  // 🔥 التعديل الرابع: حفظ آخر درس عند النقر عليه + التمركز التلقائي
  const handleLessonClick = async (lesson) => {
    const isFree = lesson.type === "free" || lesson.type === "Free";
    if (!isFree) {
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

    // 🔥 حفظ آخر درس تم النقر عليه
    saveLastLesson(realId, lesson.id);
    
    // 🔥 التمركز التلقائي للفيديو في الموبايل
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const videoSection = document.getElementById("video-player-section");
        if (videoSection) {
          videoSection.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
          });
          console.log("📱 Scrolled to video section on mobile");
        }
      }, 300);
    }
    
    if (isLoggedIn) {
      try {
        const res = await startLessonProgress(realId, lesson.id);
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

  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;
      
      // ✅ التعديل: نعتمد أولاً على الـ type الخاص بالسيكشن نفسه
      if (section.type === "free" || section.type === "Free") return true;

      // ثم نتحقق من الدروس إذا كان السيكشن ليس فري
      if (!section.lessons) return false;
      return section.lessons.some(
        (lesson) => lesson.type === "free" || lesson.type === "Free"
      );
    };
  }, [sections]);

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  const handleFileClick = (file) => {
    if (file) {
      window.open(file, "_blank");
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoPopup(true);
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
          to="/courses"
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
          courseProgress={courseProgress}
          progressLoading={progressLoading}
          hasAccess={hasAccess}
          isLoggedIn={isLoggedIn}
          onPurchaseClick={() => setShowPurchaseModal(true)}
          backPath={`/courses/${course.id}`}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {isExpired ? (
            <div className="lg:col-span-3">
              <div className="flex flex-col items-center justify-center p-8 my-8 text-center border shadow-xl bg-surface rounded-3xl border-border animate-fade-in sm:p-12 sm:my-12">
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
                  to={`/courses/${id}`}
                  className="px-6 py-3 font-semibold text-white transition-all sm:px-8 bg-primary rounded-xl hover:bg-secondary hover:scale-105"
                >
                  {t("courses.backToDetails", "العودة لتفاصيل الدورة")}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="space-y-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-2 custom-sidebar-scrollbar"
                style={{ direction: "ltr" }}
              >
                <div style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }} className="w-full">
                  <CourseContentSidebar
                    sections={sections}
                    lessons={lessons}
                    course={course}
                    courseProgress={courseProgress}
                    expandedSections={expandedSections}
                    currentLesson={currentLesson}
                    currentSection={currentSection}
                    lessonStatuses={lessonStatuses}
                    hasAccess={hasAccess}
                    isLoggedIn={isLoggedIn}
                    sectionProgress={sectionProgress}
                    calculateTotalProgress={calculateTotalProgress}
                    calculateSectionProgress={calculateSectionProgress}
                    onLessonClick={handleLessonClick}
                    onSectionClick={handleSectionClick}
                    onToggleSection={toggleSection}
                    hasFreeLessons={hasFreeLessons}
                    navigate={navigate}
                  />
                </div>
              </div>

              {/* Video Section with integrated Quizzes + Instructor Card */}
              <div id="video-player-section" className="space-y-6 lg:col-span-2">
                <VideoPlayerSection
                  currentLesson={currentLesson}
                  currentSection={currentSection}
                  course={course}
                  id={id}
                  isLoggedIn={isLoggedIn}
                  hasAccess={hasAccess}
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
                  isDescriptionExpanded={isDescriptionExpanded}
                  setIsDescriptionExpanded={setIsDescriptionExpanded}
                  setShowPurchaseModal={setShowPurchaseModal}
                  isLiveCourse={false}
                />
                <InstructorCard course={course} t={t} />
              </div>
            </>
          )}
        </div>
      </div>

      <PurchaseModal
        show={showPurchaseModal}
        onClose={closePurchaseModal}
        courseId={id}
      />

      <ImagePopup
        show={showImagePopup}
        image={selectedImage}
        onClose={() => setShowImagePopup(false)}
      />



      <VideoPopup
        show={showVideoPopup}
        video={selectedVideo}
        onClose={() => setShowVideoPopup(false)}
      />
    </section>
  );
}