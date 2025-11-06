import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { FaArrowLeft, FaDownload, FaExclamationTriangle } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function LiveCourseCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getLiveCourseById } = useApi();
  const { userData } = useUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const certificateImage = "/certificate.jpeg";

  const passedState = location.state || {};

  // Normalize percentage from various structures
  const getPercentage = (data) => {
    if (!data) return null;
    if (typeof data === 'number') return data;
    if (typeof data.score === 'number') return data.score;
    if (typeof data.percentage === 'number') return data.percentage;
    if (typeof data.student_score === 'number' && typeof data.total_score === 'number' && data.total_score > 0) {
      return (data.student_score / data.total_score) * 100;
    }
    if (typeof data.score === 'string') {
      const n = parseFloat(data.score);
      if (!Number.isNaN(n)) return n;
    }
    return null;
  };

  const storageKey = `live_course_${id}_certificate`;
  const stored = (() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const percentage = (
    passedState.finalTestPercentage ??
    getPercentage(stored) ??
    0
  );
  const certDate = stored?.date ? new Date(stored.date).toLocaleDateString() : new Date().toLocaleDateString();
  const userName = passedState.userName || userData?.name || 'Student';
  const isEligible = percentage >= 65;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getLiveCourseById(id, true);
        setCourse(data);
      } catch (err) {
        setError(err?.message || t("courses.failedToLoadCourse", "Failed to load course"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getLiveCourseById, t]);

  const downloadPDF = async () => {
    if (!isEligible) {
      alert(t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate."));
      return;
    }

    try {
      const pdf = new jsPDF("landscape", "mm", "a4");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = certificateImage;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL("image/jpeg");

        const pdfWidth = 297;
        const pdfHeight = 210;
        const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
        const scaledWidth = img.width * ratio;
        const scaledHeight = img.height * ratio;

        pdf.addImage(
          imgData,
          "JPEG",
          (pdfWidth - scaledWidth) / 2,
          (pdfHeight - scaledHeight) / 2,
          scaledWidth,
          scaledHeight
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(26);
        pdf.text(userName, 148, 115, { align: "center" });

        pdf.setFontSize(18);
        pdf.text(course?.title || "Course Title", 148, 130, { align: "center" });

        pdf.setFontSize(16);
        pdf.text(`${t("courses.scoreLabel", "Score")}: ${Math.round(percentage)}%`, 148, 142, { align: "center" });

        pdf.setFontSize(14);
        pdf.text(`${t("courses.dateLabel", "Date")}: ${certDate}`, 40, 190);
        pdf.text(t("courses.signatureLabel", "Signature: Dr. KROK Academy"), 240, 190, { align: "right" });

        pdf.save(`${course?.title || "certificate"}.pdf`);
      };
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(t("common.error", "Error") + ": " + t("courses.downloadPDF", "Download as PDF"));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isEligible) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <FaExclamationTriangle className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            {t("courses.certificateNotAvailable", "Certificate Not Available")}
          </h2>
          <p className="mb-6 text-gray-600">
            {t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate.")}
          </p>
          <div className="p-4 mb-6 bg-gray-100 rounded-lg">
            <p className="text-lg font-semibold text-gray-800">
              {t("courses.yourScore", "Your Score")}: <span className="text-red-600">{Math.round(percentage)}%</span>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {t("courses.requiredScore", "Required Score")}: 65%
            </p>
          </div>
          <button
            onClick={() => navigate(`/live-courses/${id}/lessons`)}
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
          >
            {t("courses.backToLessons", "Back to Lessons")}
          </button>
        </div>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <div className="mb-4 text-red-600">{error || t("common.error", "Error")}</div>
          <button
            onClick={() => navigate(`/live-courses/${id}/lessons`)}
            className="px-4 py-2 text-white rounded bg-primary"
          >
            {t("common.back", "Back")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-10 bg-gradient-to-br from-primary/5 to-secondary/5 text-text">
      <div className="max-w-6xl px-4 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/live-courses/${id}/lessons`)}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary"
          >
            <FaArrowLeft />
            <span>{t("courses.backToLessons", "Back to Lessons")}</span>
          </button>
          <h1 className="flex-1 text-2xl font-bold text-center">
            {t("courses.certificateOfCompletion", "Certificate of Completion")}
          </h1>
          <div className="w-10" />
        </div>

        {/* Visual certificate image with overlay */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-surface rounded-2xl shadow-2xl border border-border p-4 sm:p-8">
          <div className="relative w-full max-w-4xl aspect-[1.41/1]">
            <img
              src={certificateImage}
              alt={t("courses.certificateOfCompletion", "Certificate of Completion")}
              className="object-contain w-full h-full shadow-xl rounded-xl"
            />
            <div className="absolute inset-0 text-center text-[#0a0a0a] font-semibold">
              <p
                className="absolute font-bold text-[7vw] sm:text-[2vw] text-[#c2a10d]"
                style={{ top: "55%", left: "50%", transform: "translate(-50%, -50%)" }}
              >
                {userName}
              </p>
              <p
                className="absolute text-[4vw] sm:text-[1.5vw] text-[#333]"
                style={{ top: "63%", left: "50%", transform: "translate(-50%, -50%)" }}
              >
                {course?.title || "Course Title"}
              </p>
              <p
                className="absolute text-[3.5vw] sm:text-[1.3vw] text-[#444]"
                style={{ top: "70%", left: "50%", transform: "translate(-50%, -50%)" }}
              >
                {t("courses.scoreLabel", "Score")}: {Math.round(percentage)}%
              </p>
              <p
                className="absolute text-[3vw] sm:text-[1vw] text-[#000]"
                style={{ bottom: "13%", left: "15%" }}
              >
                {certDate}
              </p>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-3 mt-8 font-semibold text-white transition-all rounded-lg shadow-lg bg-secondary hover:bg-primary hover:shadow-xl"
          >
            <FaDownload />
            {t("courses.downloadPDF", "Download as PDF")}
          </button>
        </div>
      </div>
    </section>
  );
}


