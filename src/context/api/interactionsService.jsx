export function createInteractionsService(request) {
  // ─── Lesson Interactions (Video Course) ───────────────────────────────────

  const getVideoLessonInteractions = async (lessonId) => {
    if (!lessonId) throw new Error("lessonId is required");
    const res = await request(`video_course/lesson/${lessonId}/interactions`, {
      auth: true,
      useCache: false,
    });
    return res?.data || null;
  };

  const toggleVideoLessonLike = async (lessonId) => {
    if (!lessonId) throw new Error("lessonId is required");
    return await request(`video_lesson/${lessonId}/like`, {
      method: "POST",
      auth: true,
    });
  };

  const addVideoLessonComment = async (lessonId, body) => {
    if (!lessonId) throw new Error("lessonId is required");
    const formData = new FormData();
    formData.append("body", body);
    return await request(`video_lesson/${lessonId}/comment`, {
      method: "POST",
      auth: true,
      body: formData,
      isFormData: true,
    });
  };

  const editVideoLessonComment = async (commentId, body) => {
    if (!commentId) throw new Error("commentId is required");
    return await request(`video_lesson/video_course/comment/${commentId}`, {
      method: "PUT",
      auth: true,
      body: { body },
    });
  };

  const deleteVideoLessonComment = async (lessonId, commentId) => {
    if (!lessonId || !commentId)
      throw new Error("lessonId and commentId are required");
    return await request(`video_lesson/${lessonId}/comment/${commentId}`, {
      method: "DELETE",
      auth: true,
    });
  };

  // ─── Lesson Interactions (Live Course) ───────────────────────────────────

  const getLiveLessonInteractions = async (lessonId, batch_id) => {
    if (!lessonId || !batch_id)
      throw new Error("lessonId and batch_id are required");
    const res = await request(
      `live-course/interactions/${batch_id}/${lessonId}`,
      {
        auth: true,
        useCache: false,
      }
    );
    return res?.data || null;
  };

  const toggleLiveLessonLike = async (lessonId) => {
    if (!lessonId) throw new Error("lessonId is required");
    return await request(`live_lesson/${lessonId}/like`, {
      method: "POST",
      auth: true,
    });
  };

  const addLiveLessonComment = async (lessonId, body) => {
    if (!lessonId) throw new Error("lessonId is required");
    const formData = new FormData();
    formData.append("body", body);
    return await request(`live_lesson/${lessonId}/comment`, {
      method: "POST",
      auth: true,
      body: formData,
      isFormData: true,
    });
  };

  const editLiveLessonComment = async (lessonId, commentId, body) => {
    if (!lessonId || !commentId) throw new Error("IDs are required");
    return await request(`live_lesson/${lessonId}/comment/${commentId}`, {
      method: "PUT",
      auth: true,
      body: { body },
    });
  };

  const deleteLiveLessonComment = async (lessonId, commentId) => {
    if (!lessonId || !commentId)
      throw new Error("lessonId and commentId are required");
    return await request(`live_lesson/${lessonId}/comment/${commentId}`, {
      method: "DELETE",
      auth: true,
    });
  };

  const getLessonFlashCards = async (lessonId, page = 1, limit = 100) => {
    if (!lessonId) throw new Error("lessonId is required");
    return await request(
      `lesson/${lessonId}/flash-cards?limit=${limit}&page=${page}`,
      {
        auth: true,
        useCache: true,
      }
    );
  };

  const getLiveLessonFlashCards = async (liveLessonId, page = 1, limit = 100) => {
    if (!liveLessonId) throw new Error("liveLessonId is required");
    return await request(
      `live-lesson/${liveLessonId}/flash-cards?limit=${limit}&page=${page}`,
      {
        auth: true,
        useCache: true,
      }
    );
  };

  // ─── Essay Questions ──────────────────────────────────────────────────────

  const getLessonEssayQuestions = async (
    lessonId,
    lessonType = "video",
    page = 1,
    limit = 15
  ) => {
    if (!lessonId) throw new Error("lessonId is required");
    const endpoint =
      lessonType === "live"
        ? `live-lesson/${lessonId}/essay-questions?limit=${limit}&page=${page}`
        : `lesson/${lessonId}/essay-questions?limit=${limit}&page=${page}`;

    try {
      const res = await request(endpoint, { auth: true, useCache: false });
      return Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
    } catch {
      try {
        const res = await request(endpoint, { auth: false, useCache: false });
        return Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
      } catch {
        return [];
      }
    }
  };

  const submitEssayAnswer = async ({
    essayQuestionId,
    studentAnswer,
    isCorrect,
    scoreAchieved,
  }) => {
    return await request("essay-questions/submit", {
      method: "POST",
      auth: true,
      body: {
        essay_question_id: essayQuestionId,
        student_answer: studentAnswer,
        is_correct: isCorrect,
        score_achieved: scoreAchieved,
      },
    });
  };

  return {
    getVideoLessonInteractions,
    toggleVideoLessonLike,
    addVideoLessonComment,
    editVideoLessonComment,
    deleteVideoLessonComment,
    getLiveLessonInteractions,
    toggleLiveLessonLike,
    addLiveLessonComment,
    editLiveLessonComment,
    deleteLiveLessonComment,
    getLessonFlashCards,
    getLiveLessonFlashCards,
    getLessonEssayQuestions,
    submitEssayAnswer,
  };
}
