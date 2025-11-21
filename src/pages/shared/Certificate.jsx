import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { FaArrowLeft, FaDownload, FaExclamationTriangle, FaSync, FaCheckCircle, FaFilePdf } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, getLiveCourseById, getCertificateFile, getAuthToken, checkCertificateExists, getCertificateUrl } = useApi();
  const { userData } = useUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificatePdfUrl, setCertificatePdfUrl] = useState(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState('checking'); // 'checking', 'exists', 'not_found', 'error'

  const certificateImage = "/certificate.jpeg";

  // تحديد نوع الكورس من المسار
  const isLiveCourse = location.pathname.includes('/live-courses');
  const basePath = isLiveCourse ? '/live-courses' : '/courses';
  const backPath = `${basePath}/${id}/lessons`;
    
  const userName = userData?.name || t("courses.student", "Student");
  const certDate = new Date().toLocaleDateString();

  useEffect(() => {
    const loadCourseAndCheckCertificate = async () => {
      try {
        setLoading(true);
        setCertificateStatus('checking');
        
        // جلب بيانات الكورس
        const courseData = isLiveCourse
          ? await getLiveCourseById(id, true)
          : await getVideoCourseById(id, true);
        setCourse(courseData);

        // التحقق من وجود الشهادة في السيرفر
        const token = getAuthToken();
        if (token) {
          try {
            const courseType = isLiveCourse ? 'live' : 'video';
            const exists = await checkCertificateExists(token, id, courseType);
            
            if (exists) {
              setCertificateEligible(true);
              setCertificateStatus('exists');
              console.log("✅ Certificate exists on server");
              
              // محاولة جلب رابط الشهادة مباشرة إذا كانت موجودة
              try {
                const certificateUrl = await getCertificateUrl(token, id, courseType);
                if (certificateUrl) {
                  setCertificatePdfUrl(certificateUrl);
                  console.log("📄 Certificate URL loaded successfully:", certificateUrl);
                }
              } catch (loadError) {
                console.warn("⚠️ Certificate exists but couldn't get URL:", loadError.message);
                // لا نعرض خطأ للمستخدم لأن الشهادة موجودة ولكن هناك مشكلة في جلب الرابط
              }
            } else {
              setCertificateEligible(false);
              setCertificateStatus('not_found');
              console.log("❌ Certificate not found on server");
            }
          } catch (error) {
            console.log("⚠️ Error checking certificate:", error.message);
            setCertificateEligible(false);
            setCertificateStatus('error');
            
            // نعرض رسالة خطأ مناسبة حسب نوع الخطأ
            if (error.message.includes('NETWORK_ERROR')) {
              setCertificateError(t("courses.networkError", "Network error. Please check your connection."));
            } else if (error.message.includes('CERTIFICATE_NOT_FOUND')) {
              setCertificateError(t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate."));
            } else {
              setCertificateError(t("courses.certificateCheckError", "Error checking certificate availability."));
            }
          }
        } else {
          setCertificateEligible(false);
          setCertificateStatus('not_found');
        }

      } catch (err) {
        setError(err?.message || t("courses.failedToLoadCourse", "Failed to load course"));
        setCertificateStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseAndCheckCertificate();
  }, [id, isLiveCourse, getVideoCourseById, getLiveCourseById, getCertificateFile, checkCertificateExists, getCertificateUrl, getAuthToken, t]);

  const downloadPDF = async () => {
    // منع تحميل الشهادة إذا لم يكن مؤهلاً
    if (!certificateEligible) {
      alert(t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate."));
      return;
    }

    // إذا كانت الشهادة موجودة في السيرفر، نستخدمها مباشرة
    if (certificatePdfUrl) {
      try {
        const link = document.createElement('a');
        link.href = certificatePdfUrl;
        link.download = `${course?.title || t("courses.certificateFileName", "certificate")}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (error) {
        console.error("Error downloading PDF:", error);
        // Fallback إلى الطريقة القديمة
      }
    }

    // Fallback: إنشاء PDF محلي
    try {
      const pdf = new jsPDF("landscape", "mm", "a4");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = certificateImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        
        // إذا كانت الصورة محملة مسبقاً
        if (img.complete) resolve();
      });

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
      pdf.setFontSize(32);
      pdf.text(userName, 148, 115, { align: "center" });

      pdf.setFontSize(24);
      pdf.text(course?.title || t("courses.courseTitle", "Course Title"), 148, 130, { align: "center" });

      pdf.setFontSize(18);
      pdf.text(`${t("courses.dateLabel", "Date")}: ${certDate}`, 40, 190);
      pdf.text(t("courses.signatureLabel", "Signature: Dr. KROK Academy"), 240, 190, { align: "right" });

      pdf.save(`${course?.title || t("courses.certificateFileName", "certificate")}.pdf`);
      
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(t("common.error", "Error") + ": " + t("courses.downloadFailed", "Failed to download certificate"));
    }
  };

  const handleShowCertificate = async () => {
    if (!id) {
      setCertificateError(t("courses.courseIdRequired", "Course ID is required"));
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setCertificateError(t("courses.tokenRequired", "Authentication token is required"));
      return;
    }

    try {
      setLoadingCertificate(true);
      setCertificateError("");
      
      // تحديد نوع الكورس
      const courseType = isLiveCourse ? 'live' : 'video';
      
      // جلب رابط الشهادة من السيرفر
      const certificateUrl = await getCertificateUrl(token, id, courseType);
      
      if (!certificateUrl) {
        throw new Error("CERTIFICATE_URL_NOT_FOUND");
      }
      
      setCertificatePdfUrl(certificateUrl);
      setCertificateEligible(true);
      setCertificateStatus('exists');
      
    } catch (error) {
      console.error("Failed to get certificate URL:", error);
      
      // معالجة أنواع الأخطاء المختلفة
      if (error.message === 'CERTIFICATE_NOT_FOUND') {
        setCertificateError(
          t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate.")
        );
      } else if (error.message.includes('NETWORK_ERROR')) {
        setCertificateError(
          t("courses.networkError", "Network error. Please check your connection and try again.")
        );
      } else if (error.message === 'CERTIFICATE_URL_NOT_FOUND') {
        setCertificateError(
          t("courses.certificateUrlNotFound", "Certificate URL not found. Please contact support.")
        );
      } else {
        setCertificateError(
          t("courses.certificateLoadError", "Failed to load certificate. Please try again.")
        );
      }
    } finally {
      setLoadingCertificate(false);
    }
  };

  const handleRetry = () => {
    setCertificateError("");
    setCertificatePdfUrl(null);
    setCertificateStatus('checking');
    
    // إعادة تحميل الصفحة
    window.location.reload();
  };

  // تنظيف object URL عند unmount
  useEffect(() => {
    return () => {
      if (certificatePdfUrl && certificatePdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(certificatePdfUrl);
      }
    };
  }, [certificatePdfUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="mt-4 text-text-muted">
          {certificateStatus === 'checking' 
            ? t("courses.checkingServerCertificate", "Checking server for certificate...")
            : t("courses.loadingCourse", "Loading course...")
          }
        </p>
      </div>
    );
  }
  
  // إذا لم يكن مؤهلاً للشهادة، اعرض رسالة خطأ
  if (!certificateEligible && certificateStatus === 'not_found') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="max-w-md p-8 text-center border shadow-2xl bg-surface rounded-2xl border-border">
          <div className="flex justify-center mb-4">
            <FaExclamationTriangle className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-text">
            {t("courses.certificateNotAvailable", "Certificate Not Available")}
          </h2>
          <p className="mb-6 text-text-muted">
            {t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate.")}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(backPath)}
              className="flex-1 px-4 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
            >
              {t("courses.backToLessons", "Back to Lessons")}
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-3 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-center">
          <div className="mb-4 text-red-600">{error || t("common.error", "Error")}</div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(backPath)}
              className="px-4 py-2 text-white rounded bg-primary"
            >
              {t("common.back", "Back")}
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-white bg-gray-600 rounded"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
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
          {/* مؤشر حالة الشهادة */}
          {certificateStatus === 'exists' && (
            <div className="flex items-center gap-2 p-2 mb-4 text-green-800 bg-green-100 rounded-lg">
              <FaCheckCircle />
              <span className="text-sm">
                {certificatePdfUrl 
                  ? t("courses.certificateFromServer", "Certificate loaded from server")
                  : t("courses.certificateAvailable", "Certificate available on server")
                }
              </span>
            </div>
          )}
          
          {certificateStatus === 'error' && (
            <div className="flex items-center gap-2 p-2 mb-4 text-yellow-800 bg-yellow-100 rounded-lg">
              <FaExclamationTriangle />
              <span className="text-sm">
                {t("courses.certificateCheckWarning", "Certificate check warning")}
              </span>
            </div>
          )}

          {/* عرض الشهادة من السيرفر إذا كانت متاحة */}
          {certificatePdfUrl ? (
            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-2 mb-2 text-sm text-text-muted">
                <FaFilePdf />
                <span>{t("courses.serverCertificate", "Server Certificate")}</span>
              </div>
<iframe
  src={`${certificatePdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
  className="w-full h-[636px] border rounded-lg border-border"
  style={{ border: "none" }}
/>

              <div className="mt-2 text-sm text-center text-text-muted">
                {t("courses.pdfViewHint", "If the PDF doesn't display correctly, use the download button below")}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-2 mb-2 text-sm text-text-muted">
                <FaFilePdf />
                <span>{t("courses.previewCertificate", "Preview Certificate")}</span>
              </div>
              <div className="relative w-full aspect-[1.41/1]">
                <img
                  src={certificateImage}
                  alt={t("courses.certificateOfCompletion", "Certificate of Completion")}
                  className="object-contain w-full h-full shadow-xl rounded-xl"
                  onError={(e) => {
                    console.error("Failed to load certificate image");
                    e.target.src = "/fallback-certificate.jpg";
                  }}
                />

                {/* Overlay Data */}
                <div className="absolute inset-0 text-center text-[#0a0a0a] font-semibold">
                  {/* Student Name */}
                  <p
                    className="absolute font-bold text-[9vw] sm:text-[3vw] text-[#c2a10d]"
                    style={{
                      top: "54%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {userName}
                  </p>

                  {/* Course Title */}
                  <p
                    className="absolute text-[6vw] sm:text-[2vw] text-[#333]"
                    style={{
                      top: "62%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {course?.title || t("courses.courseTitle", "Course Title")}
                  </p>

                  {/* Date */}
                  <p
                    className="absolute text-[4vw] sm:text-[1.5vw] text-[#000]"
                    style={{
                      bottom: "15%",
                      left: "15%",
                    }}
                  >
                    {certDate}
                  </p>

                  {/* Signature */}
                  <p
                    className="absolute text-[4vw] sm:text-[1.5vw] italic text-[#000]"
                    style={{
                      bottom: "15%",
                      right: "12%",
                    }}
                  >
                    {t("courses.drKrokAcademy", "Dr. KROK Academy")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-8 sm:flex-row">
            {!certificatePdfUrl && certificateEligible && (
              <button
                onClick={handleShowCertificate}
                disabled={loadingCertificate}
                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-primary hover:bg-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCertificate ? (
                  <>
                    <FaSync className="animate-spin" />
                    {t("common.loading", "Loading...")}
                  </>
                ) : (
                  <>
                    <FaDownload />
                    {t("courses.showCertificate", "Show Certificate")}
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={downloadPDF}
              disabled={!certificateEligible}
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-secondary hover:bg-primary hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload />
              {certificatePdfUrl 
                ? t("courses.downloadPDF", "Download as PDF") 
                : t("courses.generatePDF", "Generate PDF")
              }
            </button>

            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600 hover:shadow-xl"
            >
              <FaSync />
              {t("common.retry", "Retry")}
            </button>
          </div>

          {/* Certificate Error Message */}
          {certificateError && (
            <div className="p-4 mt-4 text-red-600 bg-red-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span>{certificateError}</span>
                <button 
                  onClick={() => setCertificateError("")}
                  className="ml-4 text-red-800 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-text-muted">
          <p>{t("courses.congratulations", "Congratulations on completing the course!")}</p>
        </div>
      </div>
    </section>
  );
}