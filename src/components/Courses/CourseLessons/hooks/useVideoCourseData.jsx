import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../../../context/ApiContext";
import { useUser } from "../../../../context/UserContext";
import i18n from "../../../../i18n";
import { useLessonProgress } from "../../ProgressSystem/LessonProgress";

export function useVideoCourseData(id) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    getVideoCourseById,
    getCourseAccess,
    getCourseProgress,
    startLessonProgress,
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState({});
  const [courseProgress, setCourseProgress] = useState(null);
  const [sectionProgress, setSectionProgress] = useState({});

  const { calculateTotalProgress: calcTotalProgress, calculateSectionProgress: calcSectionProgress } = useLessonProgress();

  const calculateTotalProgress = useCallback((lesson, lessonStatus) => {
    return calcTotalProgress(lesson, lessonStatus);
  }, [calcTotalProgress]);

  const saveLastLesson = useCallback((courseId, lessonId) => {
    if (courseId && lessonId) {
      localStorage.setItem(`last_video_lesson_${courseId}`, lessonId.toString());
    }
  }, []);

  const getLastLesson = useCallback((courseId) => {
    if (!courseId) return null;
    return localStorage.getItem(`last_video_lesson_${courseId}`);
  }, []);

  const updateLessonStatus = useCallback(
    async (lessonId) => {
      if (!isLoggedIn || !course?.id) return;
      const realId = course.id;

      try {
        const [updatedCourseProgress, updatedLessonProgress] = await Promise.all([
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
      } catch (err) {
        console.error(`Error updating lesson ${lessonId} status:`, err);
      }
    },
    [isLoggedIn, course?.id, getCourseProgressDetails, getLessonProgress]
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
        quiz_percentage: hasTests && newPercentage === 100 ? 100 : prev[lessonId]?.quiz_percentage || 0,
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
            (section) => section.lessons && section.lessons.some((lesson) => lesson.type === "free" || lesson.type === "Free")
          );

          if (firstSectionWithFree) {
            setExpandedSections((prev) => new Set(prev).add(firstSectionWithFree.id));
            const firstFreeLesson = firstSectionWithFree.lessons.find(
              (lesson) => lesson.type === "free" || lesson.type === "Free"
            );
            if (firstFreeLesson) {
              targetLesson = firstFreeLesson;
              targetSection = firstSectionWithFree;
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
          } catch {
            try {
              const oldProgress = await getCourseProgress(realId);
              setCourseProgress(oldProgress);
            } catch {
              /* ignore */
            }
          }
        }

        let hasProfileAccess = false;
        if (isLoggedIn) {
          try {
            hasProfileAccess = await getCourseAccess(realId, "video_course");
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

  // Update on route state changes
  useEffect(() => {
    const s = location.state || {};
    if (s.lessonCompleted && s.lessonId && isLoggedIn) {
      updateLessonStatus(s.lessonId).catch((err) =>
        console.error("Error updating lesson status after quiz:", err)
      );
    } else if (s.courseCompleted && isLoggedIn) {
      getCourseProgressDetails(id)
        .then((updated) => updated && setCourseProgress(updated))
        .catch((err) => console.error("Error updating course progress:", err));
    }
  }, [location.state, id, isLoggedIn, getCourseProgressDetails, updateLessonStatus]);

  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;
      if (section.type === "free" || section.type === "Free") return true;
      if (!section.lessons) return false;
      return section.lessons.some((lesson) => lesson.type === "free" || lesson.type === "Free");
    };
  }, [sections]);

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
        /* ignore */
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
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      return newSet;
    });
  };

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
    toggleSection,
    showPurchaseModal,
    setShowPurchaseModal,
    lessonStatuses,
    courseProgress,
    sectionProgress,
    calculateTotalProgress,
    calculateSectionProgress,
    handleLessonComplete,
    handleLessonClick,
    handleSectionClick,
    hasFreeLessons,
    isLoggedIn,
  };
}
