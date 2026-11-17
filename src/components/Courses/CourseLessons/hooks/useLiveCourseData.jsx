import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../../../context/ApiContext";
import { useUser } from "../../../../context/UserContext";
import i18n from "../../../../i18n";
import { useLessonProgress, checkLessonHasTests } from "../../ProgressSystem/LessonProgress";
import {
  getSavedLastLessonId,
  setSavedLastLessonId,
  clearSavedLastLessonId,
  extractAllLessons,
  calculateOutlineProgress,
  isLessonAccessible,
} from "../courseLazyLoadingUtils";

export function useLiveCourseData(id) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    getLiveCourseOutline,
    getLiveCourseLessonsByIds,
    getCourseAccess,
    startLiveLessonProgress,
    completeLiveLessonProgress,
  } = useApi();
  const { isLoggedIn, user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [sections, setSections] = useState([]);
  const lessonsRef = useRef([]);
  const sectionsRef = useRef([]);

  useEffect(() => {
    lessonsRef.current = lessons;
    sectionsRef.current = sections;
  }, [lessons, sections]);

  const [hasAccess, setHasAccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isWaitingForBatch, setIsWaitingForBatch] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Lesson state & In-Memory RAM Cache
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState({});
  const [courseProgress, setCourseProgress] = useState(null);
  const [sectionProgress, setSectionProgress] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());

  // Lazy Loading specific states
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState(null);
  const lessonsCacheRef = useRef(new Map()); // In-Memory Cache: lessonId -> fullLessonData

  const { calculateTotalProgress: calcTotalProgress, calculateSectionProgress: calcSectionProgress } =
    useLessonProgress();

  const calculateTotalProgress = useCallback(
    (lesson, lessonStatus) => {
      return calcTotalProgress(lesson, lessonStatus);
    },
    [calcTotalProgress]
  );

  const calculateSectionProgress = useCallback(
    (sectionId) => {
      return calcSectionProgress(sectionId, sections, lessonStatuses, calculateTotalProgress);
    },
    [sections, lessonStatuses, calculateTotalProgress, calcSectionProgress]
  );

  // Update current time periodically for live countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const userId = user?.id || user?.user_id || null;

  // Silent background prefetch for the next lesson
  const prefetchNextLesson = useCallback(
    async (courseId, nextLessonId) => {
      if (!courseId || !nextLessonId || lessonsCacheRef.current.has(nextLessonId)) return;
      try {
        const res = await getLiveCourseLessonsByIds(courseId, [nextLessonId], true);
        if (Array.isArray(res) && res.length > 0) {
          const loaded = res.find((l) => l.id === nextLessonId) || res[0];
          if (loaded) {
            lessonsCacheRef.current.set(loaded.id, loaded);
          }
        }
      } catch (err) {
        console.debug("Silent prefetch failed for live lesson", nextLessonId, err);
      }
    },
    [getLiveCourseLessonsByIds]
  );

  // Helper to load live lesson(s) by IDs with in-memory caching
  const loadLessonsByIds = useCallback(
    async (courseId, idsToLoad, targetIdToDisplay) => {
      if (!courseId || !idsToLoad || idsToLoad.length === 0) return null;

      // Filter IDs not already in RAM cache
      const uncachedIds = idsToLoad.filter((lid) => !lessonsCacheRef.current.has(lid));

      if (uncachedIds.length > 0) {
        setLessonLoading(true);
        setLessonError(null);
        try {
          const fetchedLessons = await getLiveCourseLessonsByIds(courseId, uncachedIds, true);
          if (Array.isArray(fetchedLessons)) {
            fetchedLessons.forEach((l) => {
              lessonsCacheRef.current.set(l.id, l);
            });
          }
        } catch (fetchErr) {
          console.error("Error fetching live lesson content:", fetchErr);
          setLessonError(fetchErr?.message || "Failed to load lesson content");
          setLessonLoading(false);
          return null;
        } finally {
          setLessonLoading(false);
        }
      }

      const displayLesson = lessonsCacheRef.current.get(targetIdToDisplay);
      if (displayLesson) {
        setCurrentLesson(displayLesson);
        setCurrentSection(null);
        setSavedLastLessonId(userId, "live", courseId, displayLesson.id);

        if (isLoggedIn) {
          startLiveLessonProgress(courseId, displayLesson.id).catch(() => {});
        }
        return displayLesson;
      }
      return null;
    },
    [getLiveCourseLessonsByIds, userId, isLoggedIn, startLiveLessonProgress]
  );

  // Main load function for Live Course Outline (Lazy Loading)
  const loadOutlineData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setLessonError(null);

      // 1. Fetch lightweight outline (No show endpoint used!)
      const outlineData = await getLiveCourseOutline(id, true);
      if (!outlineData) {
        throw new Error("Live course outline not found");
      }

      setCourse(outlineData);

      if (outlineData.server_time) {
        const serverTime = new Date(outlineData.server_time).getTime();
        const localTime = Date.now();
        setServerTimeOffset(serverTime - localTime);
      }

      const rawSections = outlineData.sections || [];
      setSections(rawSections);

      const allLessons = extractAllLessons(rawSections);
      setLessons(allLessons);

      const realId = outlineData.id;

      // 2. Parse enrollment, batch assignment & access status
      const enrollment = outlineData.enrollment_status || {};
      const isEnrolled = enrollment.is_enrolled === true;
      const expired = enrollment.is_expired === true || enrollment.status === "expired";
      const suspended = enrollment.is_suspended === true || enrollment.status === "suspended";
      const completed = enrollment.status === "completed";
      const assignedToBatch = enrollment.is_assigned_to_batch !== false; // true if assigned or not specified

      const waitingForBatch = isEnrolled && enrollment.is_assigned_to_batch === false;
      setIsWaitingForBatch(waitingForBatch);

      let finalAccess = isEnrolled && !expired && !suspended;

      if (!isEnrolled && isLoggedIn) {
        try {
          const profileAccess = await getCourseAccess(realId, "live_course").catch(() => false);
          if (profileAccess) {
            finalAccess = true;
          }
        } catch {
          // Ignore
        }
      }

      setIsCompleted(completed);
      setIsExpired(expired);
      setIsSuspended(suspended);
      setHasAccess(finalAccess);

      // 3. Build initial lessonStatuses & progress directly from outline
      const initialStatuses = {};
      allLessons.forEach((l) => {
        const perc = l.percentage || 0;
        const status =
          l.progress_status || (perc >= 100 ? "completed" : perc > 0 ? "in_progress" : "not_started");
        initialStatuses[l.id] = {
          percentage: perc,
          status: status,
          progress_status: status,
          lesson_percentage: l.lesson_percentage || perc,
          quiz_percentage: l.quiz_percentage || (perc >= 100 ? 100 : 0),
        };
      });
      setLessonStatuses(initialStatuses);

      const { sectionProgressMap, overallPercentage, totalLessonsCount, totalCompletedCount } =
        calculateOutlineProgress(rawSections);
      setSectionProgress(sectionProgressMap);
      setCourseProgress({
        percentage: overallPercentage,
        completed_lessons_count: totalCompletedCount,
        total_lessons_count: totalLessonsCount,
      });

      // Outline loaded! Page can render sidebar and headers now
      setLoading(false);

      if (suspended || waitingForBatch || allLessons.length === 0) {
        return;
      }

      // 4. Determine which lesson to load first based on last_lesson in localStorage
      const savedLastId = getSavedLastLessonId(userId, "live", realId);
      let targetIndex = -1;

      if (savedLastId) {
        targetIndex = allLessons.findIndex((l) => String(l.id) === String(savedLastId));
        if (targetIndex === -1) {
          clearSavedLastLessonId(userId, "live", realId);
        }
      }

      if (targetIndex === -1) {
        // Fallback: start with the first accessible/free lesson or first lesson
        const firstFreeIdx = allLessons.findIndex(
          (l) => l.type?.toLowerCase() === "free" || l.is_free === true
        );
        targetIndex = firstFreeIdx !== -1 ? firstFreeIdx : 0;
      }

      const targetLesson = allLessons[targetIndex];
      const nextLesson = allLessons[targetIndex + 1];

      if (targetLesson) {
        if (targetLesson.section_id) {
          setExpandedSections(new Set([targetLesson.section_id]));
        }

        // Fetch target lesson and next lesson in parallel (batch up to 2 ids)
        const idsToFetch = [targetLesson.id, nextLesson?.id].filter(Boolean);
        await loadLessonsByIds(realId, idsToFetch, targetLesson.id);
      } else if (rawSections.length > 0) {
        setCurrentSection(rawSections[0]);
      }
    } catch (err) {
      console.error("Error loading live course outline:", err);
      setError(err?.message || "Failed to load live course");
      setLoading(false);
    }
  }, [
    id,
    userId,
    isLoggedIn,
    getLiveCourseOutline,
    getCourseAccess,
    loadLessonsByIds,
  ]);

  useEffect(() => {
    let active = true;
    loadOutlineData();

    const handleLanguageChange = () => {
      if (active) loadOutlineData();
    };
    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      active = false;
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [loadOutlineData]);

  // Click on a lesson
  const handleLessonClick = async (lesson) => {
    if (!lesson) return;
    const isFree = isLessonAccessible(lesson, course?.enrollment_status, hasAccess);

    if (!isFree && !hasAccess) {
      if (!isLoggedIn) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      setShowPurchaseModal(true);
      return;
    }

    if (!course?.id) return;
    const realId = course.id;

    // Check if lesson is in RAM cache
    if (lessonsCacheRef.current.has(lesson.id)) {
      const cached = lessonsCacheRef.current.get(lesson.id);
      setCurrentLesson(cached);
      setCurrentSection(null);
      setSavedLastLessonId(userId, "live", realId, lesson.id);

      if (isLoggedIn) {
        startLiveLessonProgress(realId, lesson.id).catch(() => {});
      }

      // Silent prefetch next lesson
      const all = extractAllLessons(sectionsRef.current);
      const currIdx = all.findIndex((l) => l.id === lesson.id);
      if (currIdx !== -1 && all[currIdx + 1]) {
        prefetchNextLesson(realId, all[currIdx + 1].id);
      }
    } else {
      // Fetch target lesson
      await loadLessonsByIds(realId, [lesson.id], lesson.id);

      // Silent prefetch next lesson
      const all = extractAllLessons(sectionsRef.current);
      const currIdx = all.findIndex((l) => l.id === lesson.id);
      if (currIdx !== -1 && all[currIdx + 1]) {
        prefetchNextLesson(realId, all[currIdx + 1].id);
      }
    }

    // Scroll into view on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const videoSection = document.getElementById("video-player-section");
        if (videoSection) {
          videoSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  };

  const handleSectionClick = (section) => {
    if (!section) return;
    const isFree =
      section.type?.toLowerCase() === "free" ||
      (section.lessons &&
        section.lessons.some(
          (l) => l.type?.toLowerCase() === "free" || l.is_free === true
        ));

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

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      return newSet;
    });
  };

  // Start from Beginning Action ("ابدأ من الأول")
  const handleStartFromBeginning = async () => {
    if (!course?.id) return;
    const realId = course.id;
    const all = extractAllLessons(sectionsRef.current);
    if (all.length === 0) return;

    const firstLesson = all[0];
    const secondLesson = all[1];

    if (firstLesson.section_id) {
      setExpandedSections(new Set([firstLesson.section_id]));
    }

    const idsToLoad = [firstLesson.id, secondLesson?.id].filter(Boolean);
    await loadLessonsByIds(realId, idsToLoad, firstLesson.id);
  };

  // Retry loading current lesson if failed
  const retryCurrentLesson = async () => {
    if (!course?.id || !currentLesson?.id) return;
    await loadLessonsByIds(course.id, [currentLesson.id], currentLesson.id);
  };

  // Lesson completion handler
  const handleLessonComplete = async (lessonId) => {
    const all = extractAllLessons(sectionsRef.current);
    const target = all.find((l) => l.id === lessonId) || currentLesson;
    if (!target) return;

    const hasVideo = !!target.video;
    const hasTests = checkLessonHasTests(target);
    let newPercentage = 100;
    let lessonPercentage = 100;
    let quizPercentage = 100;

    if (hasVideo && hasTests) {
      const currentStatus = lessonStatuses[lessonId] || {};
      const quizCompleted = currentStatus.quiz_percentage >= 100;
      newPercentage = quizCompleted ? 100 : 50;
      lessonPercentage = 100;
      quizPercentage = quizCompleted ? 100 : currentStatus.quiz_percentage || 0;
    }

    // 1. Optimistic UI update
    setLessonStatuses((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        percentage: newPercentage,
        status: newPercentage === 100 ? "completed" : "in_progress",
        progress_status: newPercentage === 100 ? "completed" : "in_progress",
        lesson_percentage: lessonPercentage,
        quiz_percentage: quizPercentage,
      },
    }));

    setSections((prevSections) => {
      const updated = prevSections.map((sec) => {
        if (!sec.lessons) return sec;
        return {
          ...sec,
          lessons: sec.lessons.map((l) =>
            l.id === lessonId
              ? {
                  ...l,
                  percentage: newPercentage,
                  progress_status: newPercentage === 100 ? "completed" : "in_progress",
                }
              : l
          ),
        };
      });

      const { sectionProgressMap, overallPercentage, totalLessonsCount, totalCompletedCount } =
        calculateOutlineProgress(updated);
      setSectionProgress(sectionProgressMap);
      setCourseProgress({
        percentage: overallPercentage,
        completed_lessons_count: totalCompletedCount,
        total_lessons_count: totalLessonsCount,
      });

      return updated;
    });

    // 2. Server API calls in background
    if (!course?.id) return;
    const realId = course.id;

    try {
      await completeLiveLessonProgress(realId, lessonId, "lesson");
      if (!hasTests && completeLiveLessonProgress) {
        try {
          await completeLiveLessonProgress(realId, lessonId, "quiz");
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.error("Error completing live lesson on server:", err);
    }
  };

  const hasFreeLessons = useMemo(() => {
    return (sectionId) => {
      const sec = sections.find((s) => s.id === sectionId);
      if (!sec) return false;
      if (sec.type?.toLowerCase() === "free") return true;
      if (!sec.lessons) return false;
      return sec.lessons.some(
        (l) => l.type?.toLowerCase() === "free" || l.is_free === true
      );
    };
  }, [sections]);

  const canStartFromBeginning = useMemo(() => {
    if (!lessons || lessons.length <= 1) return false;
    return currentLesson?.id !== lessons[0]?.id;
  }, [lessons, currentLesson?.id]);

  return {
    loading,
    error,
    course,
    lessons,
    sections,
    hasAccess,
    isExpired,
    isSuspended,
    isWaitingForBatch,
    isCompleted,
    currentLesson,
    setCurrentLesson,
    currentSection,
    setCurrentSection,
    expandedSections,
    setExpandedSections,
    toggleSection,
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
    isLoggedIn,
    user,
    lessonLoading,
    lessonError,
    retryCurrentLesson,
    handleStartFromBeginning,
    canStartFromBeginning,
  };
}
