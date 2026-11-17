/**
 * Course Lazy Loading Utilities
 * Handles key generation, caching helpers, outline tree processing, and access checks.
 */

export const getLastLessonStorageKey = (userId, courseType, courseId) => {
  const uid = userId ? String(userId) : "guest";
  const type = courseType === "live" ? "live" : "video";
  const cid = courseId ? String(courseId) : "unknown";
  return `last_lesson:${uid}:${type}:${cid}`;
};

export const getSavedLastLessonId = (userId, courseType, courseId) => {
  if (!courseId) return null;
  try {
    const key = getLastLessonStorageKey(userId, courseType, courseId);
    return localStorage.getItem(key);
  } catch (err) {
    console.error("Failed to read last_lesson from storage:", err);
    return null;
  }
};

export const setSavedLastLessonId = (userId, courseType, courseId, lessonId) => {
  if (!courseId || !lessonId) return;
  try {
    const key = getLastLessonStorageKey(userId, courseType, courseId);
    localStorage.setItem(key, String(lessonId));
  } catch (err) {
    console.error("Failed to save last_lesson to storage:", err);
  }
};

export const clearSavedLastLessonId = (userId, courseType, courseId) => {
  if (!courseId) return;
  try {
    const key = getLastLessonStorageKey(userId, courseType, courseId);
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Failed to clear last_lesson from storage:", err);
  }
};

/**
 * Extracts all lessons across sections in outline order
 * Only includes actual lessons (lesson_type === 'lesson' or default)
 */
export const extractAllLessons = (sections = []) => {
  if (!Array.isArray(sections)) return [];
  const lessons = [];
  sections.forEach((section) => {
    if (Array.isArray(section.lessons)) {
      section.lessons.forEach((l) => {
        // Exclude sections if mistakenly inside lessons, only lessons
        if (l && (l.lesson_type === "lesson" || !l.lesson_type)) {
          lessons.push({
            ...l,
            section_id: l.section_id || section.id,
          });
        }
      });
    }
  });
  return lessons;
};

/**
 * Calculates section progress and course progress locally from outline data
 */
export const calculateOutlineProgress = (sections = []) => {
  const sectionProgressMap = {};
  let totalLessonsCount = 0;
  let totalCompletedCount = 0;

  if (Array.isArray(sections)) {
    sections.forEach((sec) => {
      const lessons = Array.isArray(sec.lessons)
        ? sec.lessons.filter((l) => l.lesson_type === "lesson" || !l.lesson_type)
        : [];
      const total = sec.lessons_count || lessons.length;
      const completed = lessons.filter(
        (l) => l.progress_status === "completed" || l.status === "completed" || l.percentage >= 100
      ).length;

      const secPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      sectionProgressMap[sec.id] = secPercentage;

      totalLessonsCount += total;
      totalCompletedCount += completed;
    });
  }

  const overallPercentage =
    totalLessonsCount > 0
      ? Math.round((totalCompletedCount / totalLessonsCount) * 100)
      : 0;

  return {
    sectionProgressMap,
    overallPercentage,
    totalLessonsCount,
    totalCompletedCount,
  };
};

/**
 * Check if a lesson can be accessed / opened
 */
export const isLessonAccessible = (lesson, enrollmentStatus, hasAccess) => {
  if (!lesson) return false;
  const isFree =
    lesson.type?.toLowerCase() === "free" || lesson.is_free === true;
  if (isFree) return true;
  if (enrollmentStatus?.is_enrolled === true) return true;
  if (hasAccess) return true;
  return false;
};
