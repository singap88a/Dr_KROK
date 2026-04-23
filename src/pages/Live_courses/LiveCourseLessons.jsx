// LiveCourseLessons.jsx - الملف الرئيسي بعد التقسيم
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import i18n from "../../i18n";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import SectionItem from "../Courses/SectionItem";
import dayjs from "dayjs";

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
import PurchaseModal from "../Courses/Popups/PurchaseModal";

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
  FaHourglassHalf,
  FaBars,
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
  const { isLoggedIn, user } = useUser(); // 🔥 إضافة user من context

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 🔥 حالة القائمة الجانبية
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // تحديث الوقت كل 30 ثانية عشان الرابط يفتح تلقائي
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // 🔥 دالة حفظ آخر درس في localStorage
  const saveLastLesson = useCallback((courseId, lessonId) => {
    if (courseId && lessonId) {
      const storageKey = `last_live_lesson_${courseId}`;
      localStorage.setItem(storageKey, lessonId.toString());
      console.log(`💾 Saved last live lesson: ${lessonId} for course: ${courseId}`);
    }
  }, []);

  // 🔥 دالة جلب آخر درس من localStorage
  const getLastLesson = useCallback((courseId) => {
    if (!courseId) return null;
    
    const storageKey = `last_live_lesson_${courseId}`;
    const lastLesson = localStorage.getItem(storageKey);
    console.log(`📖 Retrieved last live lesson: ${lastLesson} for course: ${courseId}`);
    return lastLesson;
  }, []);

  // 🔥 دالة لفتح/غلق القائمة الجانبية
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // إغلاق القائمة الجانبية تلقائياً على الشاشات الصغيرة عند النقر على درس
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

        // ⏱️ حساب فرق التوقيت بين السيرفر والجهاز (Server Time Synchronization)
        if (courseData.server_time) {
          const serverTime = new Date(courseData.server_time).getTime();
          const localTime = Date.now();
          const offset = serverTime - localTime;
          setServerTimeOffset(offset);
          console.log(`⏱️ Time Offset Calculated: ${offset}ms (Server: ${courseData.server_time})`);
        }
        setLessons(courseData.lessons || []);
        setSections(courseData.sections || []);

        // 🔥 التعديل: كل السيكشنز مقفولة في البداية
        setExpandedSections(new Set());
        console.log("🔒 All sections locked by default");

        // 🔥 التعديل: جلب آخر درس من localStorage
        const lastLessonId = getLastLesson(id);
        let targetLesson = null;
        let targetSection = null;

        // 🔥 البحث عن الدرس الأخير
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

        // إذا مفيش آخر درس محفوظ أو المستخدم غير مسجل دخوله، نفتح أول سيكشن فيه دروس مجانية
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
              console.log(`📘 Using first free lesson for new user: ${firstFreeLesson.title}`);
            }
          }
        }

        // إذا مفيش دروس مجانية، نستخدم أول درس في أول سيكشن
        if (!targetLesson && courseData.sections && courseData.sections.length > 0) {
          const firstSection = courseData.sections[0];
          if (firstSection.lessons && firstSection.lessons.length > 0) {
            targetLesson = firstSection.lessons[0];
            targetSection = firstSection;
            setExpandedSections(prev => new Set(prev).add(firstSection.id));
            console.log(`📘 Using first lesson in first section: ${targetLesson.title}`);
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

        // 🔥 التعديل: تحديد الدرس الحالي بناءً على الأخير (للمستخدم المسجل فقط)
        if (targetLesson) {
          setCurrentLesson(targetLesson);
          if (isLoggedIn) {
            try {
              const res = await startLiveLessonProgress(id, targetLesson.id);
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
          saveLastLesson(id, targetLesson.id);
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
    getLiveCourseById,
    getCourseAccess,
    getLiveCourseProgress,
    getLiveCourseProgressDetails,
    startLiveLessonProgress,
    getLiveLessonProgress,
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
    return sections;
  }, [sections]);

  const getSectionLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return [];
      
      return section.lessons;
    };
  }, [sections]);

  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;

      // ✅ التعديل: نعتمد أولاً على الـ type الخاص بالسيكشن نفسه
      if (section.type === "free" || section.type === "Free") return true;

      if (!section.lessons) return false;
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

  // 🔥 التعديل: حفظ آخر درس عند النقر عليه + التمركز التلقائي
  const handleLessonClick = async (lesson) => {
    const isFree = lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true;
    
    // If lesson is not free and user doesn't have access
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
    
    // 🔥 حفظ آخر درس تم النقر عليه
    saveLastLesson(id, lesson.id);
    
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
    // If section is free or has free lessons and user doesn't have access
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

  // 🔥 دالة تنسيق الوقت بشكل احترافي
  const formatSessionTime = (dateString) => {
    if (!dateString) return null;
    try {
      // إذا كان التاريخ لا يحتوي على منطقة زمنية، نفترض أنه UTC (Z) ونحوله لتوقيت السيرفر للعرض
      let startGlobal = dateString;
      if (!dateString.includes("+") && !dateString.includes("Z")) {
        startGlobal = dateString.replace(" ", "T") + "Z";
      }

      // القيمة الافتراضية لأوكرانيا هي +03:00 إذا لم نجدها في server_time
      const serverOffsetStr = course?.server_time?.match(/([+-]\d{2}:\d{2})$/)?.[1] || "+03:00";

      return dayjs(startGlobal).utcOffset(serverOffsetStr).format("dddd • MMM DD, YYYY • hh:mm A");
    } catch {
      return dateString;
    }
  };

  // 🔥 دالة التحقق من تفعيل الرابط (قبل المحاضرة بـ 5 دقائق) باستخدام وقت السيرفر الموحد
  const isLinkActive = (startTime) => {
    if (!startTime || !course?.server_time) return false;
    try {
      // 1. تحويل وقت المحاضرة إلى UTC (لأن السيرفر يرسله UTC بدون علامة Z أحياناً)
      let startGlobal = startTime;
      if (!startTime.includes("+") && !startTime.includes("Z")) {
        startGlobal = startTime.replace(" ", "T") + "Z";
      }

      const start = dayjs(startGlobal).valueOf();
      if (isNaN(start)) return false;
      
      const fiveMinutes = 5 * 60 * 1000;
      
      // 2. الوقت الحالي "الحقيقي" للسيرفر (وقت الجهاز + الفرق المحسوب)
      // هذا الوقت هو بمثابة ساعة السيرفر الآن بتوقيت UTC
      const ukraineTimeNow = currentTimeMs + serverTimeOffset;
      
      return ukraineTimeNow >= (start - fiveMinutes);
    } catch (e) {
      console.error("Error calculating link active time:", e);
      return false;
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
                    ₴
                    {(
                      Number(course.discount) > 0
                        ? Number(course.price) - (Number(course.price) * Number(course.discount) / 100)
                        : Number(course.price)
                    ).toFixed(2)}
                  </span>
                  {Number(course.discount) > 0 && (
                    <>
                      <span className="text-lg line-through text-text-muted">
                        ₴{Number(course.price).toFixed(2)}
                      </span>
                      <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                        {Math.round(Number(course.discount))}%
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
          <div className="p-6 mb-6 transition-all duration-300 border shadow-sm rounded-xl bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-primary/20 hover:shadow-md dark:bg-gradient-to-br dark:from-primary/5 dark:via-background dark:to-secondary/5 dark:border-primary/10">
            <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg shadow-sm bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-primary/10 dark:to-secondary/10">
                  <FaUsers className="text-lg text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text dark:text-text">{t("liveCourses.batchInformation", "Batch Information")}</h3>
                  <p className="text-sm text-text-muted dark:text-text-muted">{t("liveCourses.batchInformationDescription", "Details about your course batch")}</p>
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
                  {t("liveCourses.joinTelegramGroup", "Join Telegram Group")}
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
                <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
                  <FaGraduationCap className="text-primary" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("liveCourses.batchName", "Batch Name")}</div>
                  <div className="font-semibold text-text dark:text-text">{course.batch_info.batch_name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
                <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
                  <FaUsers className="text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("courses.students", "Students")}</div>
                  <div className="font-semibold text-text dark:text-text">{course.batch_info.students_count}</div>
                </div>
              </div>

              {course.batch_info.status && (
                <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
                  <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
                    <FaClock className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("courses.status", "Status")}</div>
                    <div className="flex items-center gap-1 font-semibold text-text dark:text-text">
                      <span className={`inline-block w-2 h-2 rounded-full ${course.batch_info.status === 'Active' ? 'bg-green-500' : course.batch_info.status === 'Completed' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                      {course.batch_info.status}
                    </div>
                  </div>
                </div>
              )}

              {course.batch_info.instructor && (
                <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
                  <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
                    <FaUser className="text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("courses.instructor", "Instructor")}</div>
                  <div className="font-semibold text-text dark:text-text">{course.batch_info.instructor?.name || t("liveCourses.unknownInstructor", "Unknown Instructor")}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info Section */}
            <div className="pt-4 mt-4 border-t border-primary/10 dark:border-primary/5">
              <div className="flex flex-wrap gap-2">
                {course.batch_info.start_date && (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-primary/5 text-primary border border-primary/10 dark:bg-primary/10 dark:border-primary/5">
                    <FaCalendarAlt className="text-xs" />
                    <span>{t("liveCourses.starts", "Starts")}: {course.batch_info.start_date}</span>
                  </div>
                )}
                {course.batch_info.duration && (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-secondary/5 text-secondary border border-secondary/10 dark:bg-secondary/10 dark:border-secondary/5">
                    <FaHourglassHalf className="text-xs" />
                    <span>{t("liveCourses.duration", "Duration")}: {course.batch_info.duration}</span>
                  </div>
                )}
                {course.batch_info.language && (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-green-500/5 text-green-600 border border-green-500/10 dark:bg-green-500/10 dark:border-green-500/5">
                    <FaLanguage className="text-xs" />
                    <span>{t("courses.language", "Language")}: {course.batch_info.language}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 🔥 زر فتح القائمة الجانبية للشاشات الصغيرة */}
          <div className="fixed z-50 lg:hidden top-24 right-4">
            <button
              onClick={toggleSidebar}
              className="p-3 text-white transition-all duration-300 transform rounded-full shadow-lg bg-primary hover:bg-secondary hover:scale-110"
            >
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Sections and Lessons List */}
          <div className={`
            lg:col-span-1 space-y-3
            fixed lg:static top-0 left-0 h-screen lg:h-auto
            w-80 lg:w-auto bg-surface lg:bg-transparent
            shadow-2xl lg:shadow-none z-40
            transform transition-transform duration-300 ease-in-out
            border-r border-border lg:border-r-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            
            {/* 🔥 زر الإغلاق للشاشات الصغيرة داخل القائمة */}
            <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
              <h3 className="text-lg font-semibold text-text">
                {t("courses.courseContent", "Course Content")}
              </h3>
              <button
                onClick={toggleSidebar}
                className="p-2 transition-colors text-text hover:text-primary"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* محتوى القائمة */}
            <div className="p-4 lg:p-0 h-[calc(100vh-80px)] lg:h-auto overflow-y-auto sidebar-content">
              <h3 className="hidden mb-3 text-lg font-semibold lg:block text-text">
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
                    onSectionClick={handleSectionClickWithClose}
                    onLessonClick={handleLessonClickWithClose}
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
          </div>

          {/* 🔥 overlay للشاشات الصغيرة */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Video Player & Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Player */}
            <div className="overflow-hidden border rounded-lg bg-surface border-border">
              {currentLesson || currentSection ? (
                <div className="relative">
                  {((currentLesson && (
                    // 1. If not purchased: show if lesson is free
                    (!hasAccess && (currentLesson.type === "free" || currentLesson.type === "Free" || currentLesson.is_free === true)) ||
                    // 2. If purchased: show if status is active
                    (hasAccess && (currentLesson.status === "active" || currentLesson.status === "Active"))
                  )) || (currentSection && (
                    // 3. For sections: show if not purchased and has free lessons, or if purchased and active
                    (!hasAccess && hasFreeLessons(currentSection.id)) ||
                    (hasAccess && (currentSection.status === "active" || currentSection.status === "Active"))
                  ))) ? (
                    // Show ALL content
                    <>
                      <div className="relative aspect-video">
                        {(currentLesson || currentSection) && (
                          <VideoPlayer
                            currentLesson={currentLesson}
                            currentSection={currentSection}
                            handleVideoTimeUpdate={handleVideoTimeUpdate}
                            handleVideoEnd={handleVideoEnd}
                          />
                        )}

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

                        {/* Session start time - ALWAYS show if available */}
                        {(currentLesson?.started_at || currentSection?.started_at) && (
                          <div className="flex items-center gap-2 p-3 mt-3 text-sm border rounded bg-surface-2 border-border-2">
                            <FaCalendarAlt className="text-primary" />
                            <span className="font-medium">{t("liveCourses.sessionDate", "Session Date")}:</span>
                            <span className="text-text-muted">
                              {formatSessionTime(currentLesson?.started_at || currentSection?.started_at)}
                            </span>
                          </div>
                        )}

                        {/* Zoom link - ALWAYS show if available */}
                        {(currentLesson?.zoom_link || currentSection?.zoom_link) && (
                          <div className="mt-4">
                            {(() => {
                              const statusRaw = currentLesson?.status || currentSection?.status;
                              // API could return status as "active" or "Active"
                              const isLectureEnded = statusRaw && statusRaw.toString().toLowerCase() === "active";
                              let active = false;
                              let link = null;
                              if (currentLesson && currentLesson.zoom_link) {
                                active = isLinkActive(currentLesson.started_at);
                                link = currentLesson.zoom_link;
                              } else if (currentSection && currentSection.zoom_link) {
                                active = isLinkActive(currentSection.started_at);
                                link = currentSection.zoom_link;
                              }
                              return (
                                <div className="flex flex-col gap-2">
                                  {isLectureEnded ? (
                                    <>
                                      <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 w-[200px] font-bold text-white transition-all duration-300 rounded-xl shadow-md bg-gray-400 cursor-not-allowed opacity-70"
                                      >
                                        <FaVideo />
                                        {t("liveCourses.joinLiveSession", "Join Live Session")}
                                      </button>
                                      <p className="flex items-center gap-1 text-sm font-medium text-text-muted mt-1">
                                        <FaVideo className="text-gray-400" />
                                        {t("liveCourses.sessionEnded", "The session has concluded. You can watch the recorded lecture below.")}
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <a
                                        href={active ? link : undefined}
                                        target={active ? "_blank" : undefined}
                                        rel={active ? "noopener noreferrer" : undefined}
                                        onClick={(e) => !active && e.preventDefault()}
                                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 w-[200px] font-bold text-white transition-all duration-300 rounded-xl shadow-md ${
                                          active 
                                          ? "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer" 
                                          : "bg-gray-400 cursor-not-allowed opacity-70"
                                        }`}
                                      >
                                        <FaVideo />
                                        {t("liveCourses.joinLiveSession", "Join Live Session")}
                                      </a>
                                      {!active && (
                                        <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                                          <FaClock className="animate-pulse" />
                                          {t("liveCourses.linkOpensSoon", "The link will be active exactly 5 minutes before the session starts.")}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })()}
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
                          {t("liveCourses.sessionInactive", "Session is Currently Inactive")}
                        </div>

                        {/* ALWAYS show session date if available */}
                        {(currentLesson?.started_at || currentSection?.started_at) && (
                          <div className="p-3 mb-4 text-sm border rounded bg-surface-2 border-border-2">
                            <div className="flex items-center justify-center gap-2">
                              <FaCalendarAlt className="text-primary" />
                              <span className="font-medium">{t("liveCourses.sessionDate", "Session Date")}:</span>
                              <span className="text-text-muted">
                                {formatSessionTime(currentLesson?.started_at || currentSection?.started_at)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ALWAYS show zoom link if available */}
                        {(currentLesson?.zoom_link || currentSection?.zoom_link) && (
                          <div className="flex flex-col items-center gap-3 mt-6">
                            {(() => {
                              let active = false;
                              let link = null;
                              if (currentLesson && currentLesson.zoom_link) {
                                active = isLinkActive(currentLesson.started_at);
                                link = currentLesson.zoom_link;
                              } else if (currentSection && currentSection.zoom_link) {
                                active = isLinkActive(currentSection.started_at);
                                link = currentSection.zoom_link;
                              }
                              return (
                                <>
                                  <a
                                    href={active ? link : undefined}
                                    target={active ? "_blank" : undefined}
                                    rel={active ? "noopener noreferrer" : undefined}
                                    onClick={(e) => !active && e.preventDefault()}
                                    className={`inline-flex items-center justify-center gap-3 px-8 py-3.5 font-bold text-white transition-all duration-300 rounded-xl shadow-lg ${
                                      active 
                                      ? "bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer" 
                                      : "bg-gray-400 cursor-not-allowed opacity-80"
                                    }`}
                                  >
                                    <FaVideo className="text-lg" />
                                    {t("liveCourses.viewMeetingLink", "View Meeting Link")}
                                  </a>
                                  {!active && (
                                    <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800/20">
                                      <FaClock className="text-red-500 animate-pulse" />
                                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                        {t("liveCourses.linkOpensSoon", "The link will be active exactly 5 minutes before the session starts.")}
                                      </span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}

                        <p className="mt-3 text-sm text-text-muted">
                          {t("liveCourses.sessionInactiveMessage", "This session is not currently active. Please check the schedule for updates.")}
                        </p>
                      </div>
                    </div>
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