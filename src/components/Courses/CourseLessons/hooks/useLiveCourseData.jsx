import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../../../context/ApiContext";
import { useUser } from "../../../../context/UserContext";
import i18n from "../../../../i18n";
import { useLessonProgress } from "../../ProgressSystem/LessonProgress";

export function useLiveCourseData(id) {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState({});
  const [courseProgress, setCourseProgress] = useState(null);
  const [sectionProgress, setSectionProgress] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());

  const { calculateTotalProgress: calcTotalProgress, calculateSectionProgress: calcSectionProgress } = useLessonProgress();

  const calculateTotalProgress = useCallback((lesson, lessonStatus) => {
    return calcTotalProgress(lesson, lessonStatus);
  }, [calcTotalProgress]);

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const saveLastLesson = useCallback((courseId, lessonId) => {
    if (courseId && lessonId) {
      localStorage.setItem(`last_live_lesson_${courseId}`, lessonId.toString());
    }
  }, []);

  const getLastLesson = useCallback((courseId) => {
    if (!courseId) return null;
    return localStorage.getItem(`last_live_lesson_${courseId}`);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
      } catch (err) {
        console.error(`Error updating lesson ${lessonId} status:`, err);
      }
    },
    [isLoggedIn, course?.id, getLiveCourseProgressDetails, getLiveLessonProgress]
  );

  const handleLessonComplete = async (lessonId) => {
    let lesson = lessons.find((l) => l.id === lessonId);

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
    } catch (err) {
      console.error("Error completing lesson:", err);
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
        /* ignore */
      }
    }
  };

  const handleSectionClick = (section) => {
    const hasFree = (sectionId) => {
      const sectionData = sections.find((s) => s.id === sectionId);
      if (!sectionData) return false;
      if (sectionData.type === "free" || sectionData.type === "Free") return true;
      if (!sectionData.lessons) return false;
      return sectionData.lessons.some(
        (lesson) => lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
      );
    };

    const isFree = section.type === "free" || section.type === "Free" || hasFree(section.id);
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
          setServerTimeOffset(serverTime - localTime);
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
              const foundLesson = section.lessons.find((lesson) => lesson.id.toString() === lastLessonId);
              if (foundLesson) {
                targetLesson = foundLesson;
                targetSection = section;
                setExpandedSections((prev) => new Set(prev).add(section.id));
                break;
              }
            }
          }
        }

        if (!targetLesson && courseData.sections && courseData.sections.length > 0) {
          const firstSectionWithFree = courseData.sections.find(
            (section) =>
              section.type === "free" ||
              section.type === "Free" ||
              (section.lessons &&
                section.lessons.some(
                  (lesson) => lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
                ))
          );

          if (firstSectionWithFree) {
            setExpandedSections((prev) => new Set(prev).add(firstSectionWithFree.id));
            const firstFreeLesson = firstSectionWithFree.lessons.find(
              (lesson) => lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
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
            setExpandedSections((prev) => new Set(prev).add(firstSection.id));
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
              /* ignore */
            }
          }
        }

        let hasProfileAccess = false;
        if (isLoggedIn) {
          try {
            hasProfileAccess = await getCourseAccess(realId, "live_course");
          } catch {
            hasProfileAccess = courseData.price === 0 || courseData.price === "0";
          }
        }

        if (courseData.enrollment_status) {
          const { is_enrolled, is_expired: expired, status } = courseData.enrollment_status;
          const completed = status === "completed";
          let actuallyExpired = expired === true || status === "expired";
          if (!actuallyExpired && !is_enrolled && hasProfileAccess && !completed) {
            actuallyExpired = true;
          }
          setIsCompleted(completed);
          setIsExpired(actuallyExpired);
          setHasAccess(is_enrolled === true && !actuallyExpired && !completed);
        } else if (isLoggedIn) {
          if (hasProfileAccess && typeof hasProfileAccess === "object") {
            const enrolled = hasProfileAccess.is_enrolled === true;
            const expired = hasProfileAccess.is_expired === true;
            const completed = hasProfileAccess.status === "completed";
            let actuallyExpired = expired;
            if (!actuallyExpired && !enrolled && !completed) actuallyExpired = true;
            setIsCompleted(completed);
            setIsExpired(actuallyExpired && !completed);
            setHasAccess(enrolled && !actuallyExpired && !completed);
          } else {
            setIsCompleted(false);
            setIsExpired(false);
            setHasAccess(!!hasProfileAccess);
          }
        } else {
          setIsCompleted(false);
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
      updateLessonStatus(s.lessonId).catch((err) =>
        console.error("Error updating lesson status after quiz:", err)
      );
    } else if (s.courseCompleted && isLoggedIn) {
      getLiveCourseProgressDetails(id)
        .then((updated) => updated && setCourseProgress(updated))
        .catch((err) => console.error("Error updating course progress:", err));
    }
  }, [location.state, id, isLoggedIn, getLiveCourseProgressDetails, updateLessonStatus]);

  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;
      if (section.type === "free" || section.type === "Free") return true;
      if (!section.lessons) return false;
      return section.lessons.some(
        (lesson) => lesson.type === "free" || lesson.type === "Free" || lesson.is_free === true
      );
    };
  }, [sections]);

  return {
    loading,
    error,
    course,
    lessons,
    sections,
    hasAccess,
    isExpired,
    isCompleted,
    currentLesson,
    setCurrentLesson,
    currentSection,
    setCurrentSection,
    expandedSections,
    setExpandedSections,
    showPurchaseModal,
    setShowPurchaseModal,
    lessonStatuses,
    setLessonStatuses,
    courseProgress,
    setCourseProgress,
    sectionProgress,
    serverTimeOffset,
    currentTimeMs,
    isSidebarOpen,
    toggleSidebar,
    calculateTotalProgress,
    calculateSectionProgress,
    handleLessonComplete,
    handleLessonClick,
    handleSectionClick,
    handleLessonClickWithClose,
    handleSectionClickWithClose,
    hasFreeLessons,
    updateLessonStatus,
    isLoggedIn,
    user,
  };
}
