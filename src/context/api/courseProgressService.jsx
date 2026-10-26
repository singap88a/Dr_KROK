import { getAuthToken } from "./apiClient.jsx";

export function createCourseProgressService(request) {
  // Video course progress API
  const getCourseProgress = async (courseId) => {
    if (!courseId) throw new Error("Course id is required");
    const candidates = [
      `courses/${courseId}/progress`,
      `video_courses/${courseId}/progress`,
      `video_course/${courseId}/progress`,
    ];
    for (const path of candidates) {
      try {
        const res = await request(path, { auth: true });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    return { status: "not_started", percentage: 0, course_id: Number(courseId) };
  };

  const startLessonProgress = async (courseId, lessonId) => {
    if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");
    const candidates = [
      `courses/${courseId}/progress/${lessonId}/start`,
      `video_courses/${courseId}/progress/${lessonId}/start`,
      `video_course/${courseId}/progress/${lessonId}/start`,
    ];
    for (const path of candidates) {
      try {
        const res = await request(path, {
          method: "POST",
          auth: true,
          invalidateCacheOnSuccess: [`courses/${courseId}`, `progress`],
        });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    throw new Error("Progress start endpoint not available");
  };

  const completeLessonProgress = async (courseId, lessonId, type) => {
    if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

    const formData = new FormData();
    formData.append("course", String(courseId));
    formData.append("lesson", String(lessonId));
    formData.append("type", type || "lesson");

    const candidates = [
      `courses/${courseId}/progress/${lessonId}/complete`,
      `video_courses/${courseId}/progress/${lessonId}/complete`,
      `video_course/${courseId}/progress/${lessonId}/complete`,
    ];

    for (const path of candidates) {
      try {
        const res = await request(path, {
          method: "POST",
          auth: true,
          body: formData,
          isFormData: true,
          invalidateCacheOnSuccess: [
            `courses/${courseId}`,
            `progress`,
            `video_course/${courseId}`,
            `course/${courseId}`,
          ],
        });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    throw new Error("Progress complete endpoint not available");
  };

  const getCourseProgressDetails = async (courseId) => {
    if (!courseId) throw new Error("Course id is required");
    const candidates = [
      `courses/${courseId}/progress`,
      `video_courses/${courseId}/progress`,
      `video_course/${courseId}/progress`,
    ];
    for (const path of candidates) {
      try {
        const res = await request(path, { auth: true });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    return null;
  };

  const markLessonAsCompleted = async (courseId, lessonId) => {
    if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

    const formData = new FormData();
    formData.append("course", String(courseId));
    formData.append("lesson", String(lessonId));
    formData.append("type", "lesson");

    const candidates = [
      `courses/${courseId}/progress/${lessonId}/complete`,
      `video_courses/${courseId}/progress/${lessonId}/complete`,
      `video_course/${courseId}/progress/${lessonId}/complete`,
    ];

    for (const path of candidates) {
      try {
        const res = await request(path, {
          method: "POST",
          auth: true,
          body: formData,
          isFormData: true,
          invalidateCacheOnSuccess: [
            `courses/${courseId}`,
            `progress`,
            `video_course/${courseId}`,
          ],
        });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) {
          console.warn(`Failed with endpoint ${path}:`, e.message);
          continue;
        }
      }
    }
    throw new Error("Lesson complete endpoint not available");
  };

  // Live Course Progress API functions
  const getLiveCourseProgress = async (courseId) => {
    if (!courseId) throw new Error("Course id is required");
    const candidates = [
      `live_courses/${courseId}/progress`,
      `courses/${courseId}/progress`,
    ];
    for (const path of candidates) {
      try {
        const res = await request(path, { auth: true });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    return { status: "not_started", percentage: 0, course_id: Number(courseId) };
  };

  const startLiveLessonProgress = async (courseId, lessonId) => {
    if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");
    const candidates = [
      `live_courses/${courseId}/progress/${lessonId}/start`,
      `courses/${courseId}/progress/${lessonId}/start`,
    ];
    for (const path of candidates) {
      try {
        const res = await request(path, {
          method: "POST",
          auth: true,
          invalidateCacheOnSuccess: [
            `courses/${courseId}`,
            `progress`,
            `live_courses/${courseId}`,
            `live_course/${courseId}`,
          ],
        });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    throw new Error("Live course progress start endpoint not available");
  };

  const completeLiveLessonProgress = async (courseId, lessonId, type) => {
    if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const formData = new FormData();
    formData.append("course", String(courseId));
    formData.append("lesson", String(lessonId));
    formData.append("type", type || "lesson");

    try {
      const res = await request(
        `live_courses/${courseId}/progress/${lessonId}/complete`,
        {
          method: "POST",
          body: formData,
          isFormData: true,
          auth: true,
          invalidateCacheOnSuccess: [
            `courses/${courseId}`,
            `progress`,
            `live_courses/${courseId}`,
            `live_course/${courseId}`,
            `course/${courseId}`,
          ],
        }
      );

      if (!res) {
        throw new Error("No response from server");
      }

      if (res.code === 422) {
        throw new Error(res.message || "The selected lesson is invalid.");
      }

      if (!res.success && res.code !== 200) {
        throw new Error(res.message || "Failed to complete lesson progress");
      }

      return res;
    } catch (error) {
      console.error("Error completing lesson progress:", error);

      if (
        error.message.includes("The selected lesson is invalid") ||
        error.status === 422
      ) {
        const alternativeFormData = new FormData();
        alternativeFormData.append("course_id", String(courseId));
        alternativeFormData.append("lesson_id", String(lessonId));
        alternativeFormData.append("type", type || "quiz");

        try {
          const altRes = await request(
            `courses/${courseId}/progress/${lessonId}/complete`,
            {
              method: "POST",
              body: alternativeFormData,
              isFormData: true,
              auth: true,
              invalidateCacheOnSuccess: [
                `courses/${courseId}`,
                `progress`,
                `live_courses/${courseId}`,
                `live_course/${courseId}`,
              ],
            }
          );

          return altRes;
        } catch (altError) {
          console.error("Alternative endpoint also failed:", altError);
          throw altError;
        }
      }

      throw error;
    }
  };

  const getLiveCourseProgressDetails = async (courseId) => {
    if (!courseId) throw new Error("Course id is required");
    const candidates = [
      `live_courses/${courseId}/progress`,
      `courses/${courseId}/progress`,
    ];
    for (const path of candidates) {
      try {
        const res = await request(path, { auth: true });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    return null;
  };

  const markLiveLessonAsCompleted = async (courseId, lessonId) => {
    if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

    const formData = new FormData();
    formData.append("course", String(courseId));
    formData.append("lesson", String(lessonId));
    formData.append("type", "lesson");

    const candidates = [
      `live_courses/${courseId}/progress/${lessonId}/complete`,
      `courses/${courseId}/progress/${lessonId}/complete`,
    ];

    for (const path of candidates) {
      try {
        const res = await request(path, {
          method: "POST",
          auth: true,
          body: formData,
          isFormData: true,
          invalidateCacheOnSuccess: [
            `courses/${courseId}`,
            `progress`,
            `live_courses/${courseId}`,
            `live_course/${courseId}`,
          ],
        });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) {
          console.warn(`Failed with endpoint ${path}:`, e.message);
          continue;
        }
      }
    }
    throw new Error("Live lesson complete endpoint not available");
  };

  const getLiveLessonProgress = async (courseId, lessonId) => {
    if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");
    const candidates = [
      `live_courses/${courseId}/progress/${lessonId}`,
      `courses/${courseId}/progress/${lessonId}`,
    ];
    for (const path of candidates) {
      try {
        const res = await request(path, { auth: true });
        return res?.data || null;
      } catch (e) {
        if (e?.status && e.status !== 404) throw e;
      }
    }
    return null;
  };

  const getMyCoursesProgress = async (params = {}, { useCache = false } = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== "all") query.append("type", params.type);
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.per_page) query.append("per_page", params.per_page);
    if (params.page) query.append("page", params.page);
    if (params.video_page) query.append("video_page", params.video_page);
    if (params.live_page) query.append("live_page", params.live_page);

    const queryString = query.toString();
    const endpoint = `profile/my-courses-progress${queryString ? `?${queryString}` : ""}`;

    const response = await request(endpoint, {
      auth: true,
      useCache,
      cacheTTL: 2 * 60 * 1000,
    });
    return response;
  };

  return {
    getCourseProgress,
    startLessonProgress,
    completeLessonProgress,
    getCourseProgressDetails,
    markLessonAsCompleted,
    getLiveCourseProgress,
    startLiveLessonProgress,
    completeLiveLessonProgress,
    getLiveCourseProgressDetails,
    markLiveLessonAsCompleted,
    getLiveLessonProgress,
    getMyCoursesProgress,
  };
}
