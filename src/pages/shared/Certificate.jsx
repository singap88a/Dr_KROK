import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { FaArrowLeft, FaDownload, FaExclamationTriangle, FaSync } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, getFinalTestResult } = useApi();
  const { userData } = useUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [checkingServer, setCheckingServer] = useState(false);

  const certificateImage = "/certificate.jpeg";

  // تحديد نوع الكورس من المسار
  const isLiveCourse = location.pathname.includes('/live-courses');
  const basePath = isLiveCourse ? '/live-courses' : '/courses';
  const backPath = `${basePath}/${id}/lessons`;

  const passedState = location.state || {};
  
  // Helper: normalize percentage from different result shapes
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

  // جلب البيانات من مصادر متعددة
  const storageKey = isLiveCourse 
    ? `live_course_${id}_certificate`
    : `course_${id}_certificate_${userData?.id || 'anonymous'}`;
  
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
    getPercentage(certificateInfo) ??
    0
  );
  
  const certDate = stored?.date 
    ? new Date(stored.date).toLocaleDateString() 
    : certificateInfo?.date 
    ? new Date(certificateInfo.date).toLocaleDateString()
    : new Date().toLocaleDateString();
    
  const userName = passedState.userName || userData?.name || t("courses.student", "Student");

  useEffect(() => {
    const loadCourseAndResult = async () => {
      try {
        setLoading(true);
        
        // جلب بيانات الكورس
        const courseData = isLiveCourse
          ? await getLiveCourseById(id, true)
          : await getVideoCourseById(id, true);
        setCourse(courseData);

        // جلب نتيجة الاختبار النهائي من السيرفر (للفيديو كورس فقط)
        if (!isLiveCourse && userData?.id && getFinalTestResult) {
          setCheckingServer(true);
          try {
            const serverResult = await getFinalTestResult(id);
            const normalized = getPercentage(serverResult);
            if (serverResult && typeof normalized === 'number') {
              setCertificateInfo({ ...serverResult, score: normalized, fromServer: true });
              console.log('✅ Using server result:', { ...serverResult, score: normalized });
            }
          } catch {
            console.log('ℹ️ No server result available, using local storage');
          } finally {
            setCheckingServer(false);
          }
        }

      } catch (err) {
        setError(err?.message || t("courses.failedToLoadCourse", "Failed to load course"));
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseAndResult();
  }, [id, isLiveCourse, getVideoCourseById, getLiveCourseById, getFinalTestResult, userData, t]);

  // استخدام بيانات السيرفر إذا كانت متاحة
  const finalPercentage = (typeof certificateInfo?.score === 'number') ? certificateInfo.score : percentage;
  const finalIsEligible = finalPercentage >= 65;

  const downloadPDF = async () => {
    // منع تحميل الشهادة إذا لم يكن مؤهلاً
    if (!finalIsEligible) {
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
        pdf.text(course?.title || t("courses.courseTitle", "Course Title"), 148, 130, { align: "center" });

        pdf.setFontSize(16);
        pdf.text(`${t("courses.scoreLabel", "Score")}: ${Math.round(finalPercentage)}%`, 148, 142, { align: "center" });

        pdf.setFontSize(14);
        pdf.text(`${t("courses.dateLabel", "Date")}: ${certDate}`, 40, 190);
        pdf.text(t("courses.signatureLabel", "Signature: Dr. KROK Academy"), 240, 190, { align: "right" });

        pdf.save(`${course?.title || t("courses.certificateFileName", "certificate")}.pdf`);
      };
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(t("common.error", "Error") + ": " + t("courses.downloadPDF", "Download as PDF"));
    }
  };

  if (loading || checkingServer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
        {checkingServer && (
          <p className="mt-4 text-text-muted">{t("courses.checkingTestResults", "Checking test results...")}</p>
        )}
      </div>
    );
  }
  
  // إذا لم يكن مؤهلاً للشهادة، اعرض رسالة خطأ
  if (!finalIsEligible) {
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
          <button
            onClick={() => navigate(backPath)}
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
            onClick={() => navigate(backPath)}
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
            onClick={() => navigate(backPath)}
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

        {/* Certificate Container */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-surface rounded-2xl shadow-2xl border border-border p-4 sm:p-8">
          {certificateInfo?.fromServer && (
            <div className="flex items-center gap-2 p-2 mb-4 text-green-800 bg-green-100 rounded-lg">
              <FaSync className="animate-spin" />
              <span className="text-sm">{t("courses.verifiedServerResult", "Verified Server Result")}</span>
            </div>
          )}
          
          <div className="relative w-full max-w-4xl aspect-[1.41/1]">
            <img
              src={certificateImage}
              alt={t("courses.certificateOfCompletion", "Certificate of Completion")}
              className="object-contain w-full h-full shadow-xl rounded-xl"
            />

            {/* Overlay Data */}
            <div className="absolute inset-0 text-center text-[#0a0a0a] font-semibold">
              {/* Student Name */}
              <p
                className="absolute font-bold text-[7vw] sm:text-[2vw] text-[#c2a10d]"
                style={{
                  top: "55%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {userName}
              </p>

              {/* Course Title */}
              <p
                className="absolute text-[4vw] sm:text-[1.5vw] text-[#333]"
                style={{
                  top: "63%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {course?.title || t("courses.courseTitle", "Course Title")}
              </p>

              {/* Score */}
              <p
                className="absolute text-[3.5vw] sm:text-[1.3vw] text-[#444]"
                style={{
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {t("courses.scoreLabel", "Score")}: {Math.round(finalPercentage)}%
              </p>

              {/* Date */}
              <p
                className="absolute text-[3vw] sm:text-[1vw] text-[#000]"
                style={{
                  bottom: "13%",
                  left: "15%",
                }}
              >
                 {certDate}
              </p>

              {/* Signature */}
              <p
                className="absolute text-[3vw] sm:text-[1vw] italic text-[#000]"
                style={{
                  bottom: "13%",
                  right: "12%",
                }}
              >
                 {t("courses.drKrokAcademy", "Dr. KROK Academy")}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-3 mt-8 font-semibold text-white transition-all rounded-lg shadow-lg bg-secondary hover:bg-primary hover:shadow-xl"
          >
            <FaDownload />
            {t("courses.downloadPDF", "Download as PDF")}
          </button>
        </div>

        <div className="mt-8 text-center text-text-muted">
          <p>{t("courses.congratulations", "Congratulations on completing the course!")}</p>
        </div>
      </div>
    </section>
  );
}

// ظظظظ