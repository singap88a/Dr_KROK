// ProgressSystem/LessonProgress.jsx
import React from "react";

export const checkLessonHasTests = (lesson) => {
  if (!lesson) return false;
  return Boolean(
    (lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0) ||
    (lesson.periodic_quizzes && lesson.periodic_quizzes.length > 0) ||
    (lesson.quizzes && lesson.quizzes.length > 0) ||
    (lesson.tests && lesson.tests.length > 0) ||
    lesson.has_quiz ||
    lesson.has_tests
  );
};

export const useLessonProgress = () => {
  const calculateTotalProgress = React.useCallback((lesson, lessonStatus) => {
    if (!lessonStatus) return 0;

    if (
      lessonStatus.status === "completed" ||
      lessonStatus.progress_status === "completed" ||
      lessonStatus.percentage >= 100
    ) {
      return 100;
    }

    const hasVideo = !!lesson?.video;
    const hasTests = checkLessonHasTests(lesson);

    // If the lesson has no tests:
    // Any completion of the lesson/video content (marked completed, or backend percentage >= 50, or lesson_percentage >= 100)
    // means the lesson is 100% completed.
    if (!hasTests) {
      if (
        lessonStatus.percentage >= 50 ||
        lessonStatus.lesson_percentage >= 100 ||
        lessonStatus.status === "completed" ||
        lessonStatus.progress_status === "completed"
      ) {
        return 100;
      }
      return Math.min(
        100,
        Math.max(0, lessonStatus.lesson_percentage || lessonStatus.percentage || 0)
      );
    }

    // If the lesson has tests:
    const videoProgress =
      lessonStatus.lesson_percentage !== undefined
        ? lessonStatus.lesson_percentage
        : hasVideo
        ? lessonStatus.percentage >= 50
          ? 100
          : 0
        : 100;
    const quizProgress =
      lessonStatus.quiz_percentage !== undefined
        ? lessonStatus.quiz_percentage
        : 0;

    if (hasVideo) {
      if (videoProgress >= 100 && quizProgress >= 100) {
        return 100;
      } else if (videoProgress >= 100 && quizProgress < 100) {
        return 50;
      } else if (quizProgress >= 100 && videoProgress < 100) {
        return 50;
      } else {
        return Math.min(100, Math.round((videoProgress + quizProgress) / 2));
      }
    } else {
      return Math.min(100, Math.max(0, quizProgress));
    }
  }, []);

  const calculateSectionProgress = React.useCallback(
    (sectionId, sections, lessonStatuses, calculateTotalProgress) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons || section.lessons.length === 0) {
        return { percentage: 0, completedLessons: 0, totalLessons: 0 };
      }

      let totalProgress = 0;
      let completedLessons = 0;

      section.lessons.forEach((lesson) => {
        const lessonStatus = lessonStatuses[lesson.id];
        const progress = calculateTotalProgress
          ? calculateTotalProgress(lesson, lessonStatus)
          : (lessonStatus?.percentage || 0);

        totalProgress += progress;
        if (progress >= 100) {
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
    []
  );

  return {
    calculateTotalProgress,
    calculateSectionProgress,
  };
};
