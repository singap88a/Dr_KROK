// ProgressSystem/LessonProgress.jsx
import React from "react";

export const useLessonProgress = () => {
  const calculateTotalProgress = React.useCallback((lesson, lessonStatus) => {
    if (!lessonStatus) return 0;

    if (lessonStatus.status === "completed" || lessonStatus.progress_status === "completed") {
      return 100;
    }

    if (lessonStatus.percentage !== undefined && lessonStatus.percentage !== null) {
      return Math.min(100, Math.max(0, lessonStatus.percentage));
    }

    const hasVideo = !!lesson.video;
    const hasTests = lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;

    let totalProgress = 0;

    if (hasVideo && hasTests) {
      const videoProgress = lessonStatus.lesson_percentage || 0;
      const quizProgress = lessonStatus.quiz_percentage || 0;

      if (videoProgress >= 100 && quizProgress < 100) {
        totalProgress = 50;
      } else if (quizProgress >= 100 && videoProgress < 100) {
        totalProgress = 50;
      } else if (videoProgress >= 100 && quizProgress >= 100) {
        totalProgress = 100;
      } else {
        totalProgress = Math.max(videoProgress, quizProgress) / 2;
      }
    } else if (hasTests && !hasVideo) {
      totalProgress = lessonStatus.quiz_percentage || 0;
    } else if (hasVideo && !hasTests) {
      totalProgress = lessonStatus.lesson_percentage || 0;
    }

    return Math.min(100, totalProgress);
  }, []);

  const calculateSectionProgress = React.useCallback((sectionId, sections, lessonStatuses, calculateTotalProgress) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.lessons || section.lessons.length === 0) {
      return { percentage: 0, completedLessons: 0, totalLessons: 0 };
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
  }, []);

  return {
    calculateTotalProgress,
    calculateSectionProgress,
  };
};