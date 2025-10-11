import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { FaArrowLeft, FaTrophy, FaRedo, FaCertificate } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CourseFinalTestResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById } = useApi();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const passedState = location.state || {};
  const results = passedState.results || null;
  const test = passedState.test || null;

  const { userData } = useUser();
  const userName = userData?.name || 'Student';

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const courseData = await getVideoCourseById(id, true);
        setCourse(courseData);
      } catch (err) {
        setError(err?.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id, getVideoCourseById]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course || !results || !test) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <div className="mb-4 text-red-600">{error || "Missing data"}</div>
          <button
            onClick={() => navigate(`/courses/${id}/lessons`)}
            className="px-4 py-2 text-white rounded bg-primary"
          >
            {t("common.back", "Back")}
          </button>
        </div>
      </section>
    );
  }

  const totalQuestions = test.quizzes?.length || 0;
  const answered = Object.keys(results.answers || {}).length;
  const unanswered = totalQuestions - answered;
  const percentage = results.percentage || 0;
  const passed = percentage >= 65;

  return (
    <section className="min-h-screen py-10 bg-gradient-to-br from-primary/5 to-secondary/5 text-text">
      <div className="max-w-4xl px-4 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/courses/${id}/lessons`)}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary"
          >
            <FaArrowLeft />
            <span>{t("courses.backToLessons", "Back to Lessons")}</span>
          </button>
          <h1 className="flex-1 text-2xl font-bold text-center">
            {t("courses.finalTestResults", "Final Test Results")}
          </h1>
          <div className="w-10" />
        </div>

        {/* Results Card */}
        <div className="overflow-hidden border shadow-2xl rounded-2xl bg-surface border-border">
          <div className="p-8 text-center">
            <div className="mb-6">
              <FaTrophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-3xl font-bold text-primary">{course.title}</h2>
              <p className="text-lg text-text-muted">{t("courses.finalTest", "Final Test")}</p>
            </div>

            {/* Score */}
            <div className="mb-8">
              <div className="mb-2 text-6xl font-bold text-secondary">{Math.round(percentage)}%</div>
              <div className="text-xl text-text-muted">
                {passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed")}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                <div className="text-sm text-text-muted">{t("courses.totalQuestions", "Total Questions")}</div>
              </div>
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-green-600">{answered}</div>
                <div className="text-sm text-text-muted">{t("courses.answered", "Answered")}</div>
              </div>
              <div className="p-4 border rounded-lg bg-accent border-border">
                <div className="text-2xl font-bold text-red-600">{unanswered}</div>
                <div className="text-sm text-text-muted">{t("courses.unanswered", "Unanswered")}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-center">
              {passed ? (
                <button
                  onClick={() => {
                    // Store certificate data in localStorage for persistence
                    const certificateData = {
                      score: percentage,
                      date: new Date().toISOString(),
                      passed: true
                    };
                    localStorage.setItem(`course_${id}_certificate`, JSON.stringify(certificateData));
                    localStorage.setItem(`course_${id}_certificate_score`, percentage.toString());
                    navigate(`/courses/${id}/certificate`, { 
                      state: { finalTestPercentage: percentage, userName } 
                    });
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all rounded-lg shadow-lg bg-secondary hover:bg-primary hover:shadow-xl"
                >
                  <FaCertificate />
                  {t("courses.viewCertificate", "View Certificate")}
                </button>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-lg text-red-600">{t("courses.retakeRequired", "You need to retake the test to pass.")}</p>
                  <button
                    onClick={() => navigate(`/courses/${id}/lessons`)}
                    className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all rounded-lg shadow-lg bg-primary hover:bg-secondary hover:shadow-xl"
                  >
                    <FaRedo />
                    {t("courses.backToLessons", "Back to Lessons")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
