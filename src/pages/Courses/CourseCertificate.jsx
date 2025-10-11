import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CourseCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById } = useApi();
  const { userData } = useUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificateInfo, setCertificateInfo] = useState(null);

  const certificateImage = "/certificate.jpeg"; // استخدم الصورة دي من عندك

  const passedState = location.state || {};
  const storedData = localStorage.getItem(`course_${id}_certificate`);
  const storedInfo = storedData ? JSON.parse(storedData) : null;
  const percentage = passedState.finalTestPercentage || (storedInfo ? storedInfo.score : 0);
  const certDate = storedInfo ? new Date(storedInfo.date).toLocaleDateString() : new Date().toLocaleDateString();
  const userName = passedState.userName || userData?.name || 'Student';

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

  useEffect(() => {
    if (storedData && !certificateInfo) {
      setCertificateInfo(storedInfo);
    }
  }, [storedData, certificateInfo]);

  const downloadPDF = async () => {
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
        pdf.text(`Score: ${Math.round(percentage)}%`, 148, 142, { align: "center" });

        pdf.setFontSize(14);
        pdf.text(`Date: ${certDate}`, 40, 190);
        pdf.text("Signature: Dr. KROK Academy", 240, 190, { align: "right" });

        pdf.save(`${course?.title || "certificate"}.pdf`);
      };
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to download PDF.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !course || (!percentage && !storedInfo))
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <div className="mb-4 text-red-600">{error || t("common.error", "Error")}</div>
          <button
            onClick={() => navigate(`/courses/${id}/lessons`)}
            className="px-4 py-2 text-white rounded bg-primary"
          >
            {t("common.back", "Back")}
          </button>
        </div>
      </section>
    );

  return (
    <section className="min-h-screen py-10 bg-gradient-to-br from-primary/5 to-secondary/5 text-text">
      <div className="max-w-6xl px-4 mx-auto">
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
            {t("courses.certificateOfCompletion", "Certificate of Completion")}
          </h1>
          <div className="w-10" />
        </div>

        {/* Certificate Container */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-surface rounded-2xl shadow-2xl border border-border p-4 sm:p-8">
          <div className="relative w-full max-w-4xl aspect-[1.41/1]">
            <img
              src={certificateImage}
              alt="Certificate"
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
                {course?.title || "Course Title"}
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
                Score: {Math.round(percentage)}%
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
                 Dr. KROK Academy
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
