export function createStudyTrackerService(request) {
  // ─── Study Tracker & Streak System ─────────────────────────────────────
  const logStudyTime = async ({
    duration_seconds,
    activity_type = "general",
    course_id = null,
    course_type = null,
    lesson_id = null,
  }) => {
    const body = {
      duration_seconds: Math.round(duration_seconds),
      activity_type: activity_type || "general",
    };
    if (course_id) body.course_id = Number(course_id);
    if (course_type) body.course_type = course_type;
    if (lesson_id) body.lesson_id = Number(lesson_id);

    return await request("study-tracker/log-time", {
      method: "POST",
      auth: true,
      body,
      useCache: false,
    });
  };

  const getStudySummary = async () => {
    return await request("study-tracker/summary", {
      method: "GET",
      auth: true,
      useCache: false,
    });
  };

  const getStudyMonthlyReport = async ({ month, year } = {}) => {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return await request(`study-tracker/monthly-report${queryStr}`, {
      method: "GET",
      auth: true,
      useCache: false,
    });
  };

  return {
    logStudyTime,
    getStudySummary,
    getStudyMonthlyReport,
  };
}
