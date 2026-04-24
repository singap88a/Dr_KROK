import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaExclamationTriangle, 
  FaSync, 
  FaCheckCircle, 
  FaFilePdf,
  FaAward
} from "react-icons/fa";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { 
  formatProfessionalDate, 
  calculateGrade, 
  extractColorFromImage, 
  generateProfessionalCertificatePDF 
} from "../../utils/certificateUtils";

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
  const [certificateStatus, setCertificateStatus] = useState('checking');
  const [grade, setGrade] = useState(""); // التقدير بالانجليزية
  const [studentNameColor, setStudentNameColor] = useState("#c2a10d"); // اللون الأصفر الافتراضي

  const certificateImage = "/certificate_1.jpg";
  const canvasRef = useRef(null);

  // تحديد نوع الكورس من المسار
  const isLiveCourse = location.pathname.includes('/live-courses');
  const basePath = isLiveCourse ? '/live-courses' : '/courses';
  const backPath = `${basePath}/${id}/lessons`;
    
  const userName = userData?.name || t("courses.student", "Student");
  const certDate = formatProfessionalDate();

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

        // استخراج اللون من الصورة (محاكاة)
        const extractedColor = extractColorFromImage();
        setStudentNameColor(extractedColor);

        // حساب التقدير (محاكاة - في الواقع سيأتي من السيرفر)
        const mockPercentage = location.state?.percentage || 85; // هذا سيأتي من بيانات الطالب
        setGrade(calculateGrade(mockPercentage));

        // التحقق من وجود الشهادة في السيرفر
        const token = getAuthToken();
        const courseType = isLiveCourse ? 'live' : 'video';
        
        let serverUrl = null;

        if (token && !location.state?.bypassServerCheck) {
          try {
            const exists = await checkCertificateExists(token, id, courseType);
            if (exists) {
              serverUrl = await getCertificateUrl(token, id, courseType);
              console.log("✅ Certificate exists on server");
            }
          } catch (error) {
            console.log("⚠️ Error checking certificate:", error.message);
          }
        }

        if (serverUrl) {
          setCertificatePdfUrl(serverUrl);
          setCertificateEligible(true);
          setCertificateStatus('exists');
        } else if (location.state?.bypassServerCheck || mockPercentage >= 65) {
          // جينيريشن محلي إذا كان مسموح بالتجاوز أو النسبة كافية
          setCertificateEligible(true);
          setCertificateStatus('exists');
          console.log("🎨 Generating local certificate preview...");
          
          // تأخير بسيط للتأكد من تحميل بيانات الكورس
          setTimeout(async () => {
            try {
              const localBlob = await generateProfessionalPDF();
              const localUrl = URL.createObjectURL(localBlob);
              setCertificatePdfUrl(localUrl);
            } catch (genError) {
              console.error("❌ Failed to generate local preview:", genError);
            }
          }, 500);
        } else {
          setCertificateEligible(false);
          setCertificateStatus('not_found');
          setCertificateError(t("courses.certificateRequirement", "You need to score 65% or higher in the final test to unlock your certificate."));
        }

      } catch (err) {
        setError(err?.message || t("courses.failedToLoadCourse", "Failed to load course"));
        setCertificateStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseAndCheckCertificate();
  }, [id, isLiveCourse, getVideoCourseById, getLiveCourseById, checkCertificateExists, getCertificateUrl, getAuthToken, t, location.state]);

  // دالة محسنة لإنشاء PDF الشهادة المحترف
  const generatePDF = useCallback(() => {
    return generateProfessionalCertificatePDF({
      course,
      userName,
      percentage: location.state?.percentage || 85,
      grade,
      studentNameColor,
      certificateImage,
      t
    });
  }, [course, location.state, userName, t, grade, studentNameColor]);

  const downloadPDF = async () => {
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
      }
    }

    // Fallback: إنشاء PDF محلي محترف
    try {
      const pdfBlob = await generatePDF();
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${course?.title || t("courses.certificateFileName", "certificate")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الـ URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
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
      
      const courseType = isLiveCourse ? 'live' : 'video';
      const certificateUrl = await getCertificateUrl(token, id, courseType);
      
      if (!certificateUrl) {
        throw new Error("CERTIFICATE_URL_NOT_FOUND");
      }
      
      setCertificatePdfUrl(certificateUrl);
      setCertificateEligible(true);
      setCertificateStatus('exists');
      
    } catch (error) {
      console.error("Failed to get certificate URL:", error);
      
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
          {/* Certificate Status */}
          {/* {certificateStatus === 'exists' && (
            <div className="flex items-center gap-2 p-2 mb-4 text-green-800 bg-green-100 rounded-lg">
              <FaCheckCircle />
              <span className="text-sm">
                {certificatePdfUrl 
                  ? t("courses.certificateFromServer", "Certificate loaded from server")
                  : t("courses.certificateAvailable", "Certificate available on server")
                }
              </span>
            </div>
          )} */}
          
          {certificateStatus === 'error' && (
            <div className="flex items-center gap-2 p-2 mb-4 text-yellow-800 bg-yellow-100 rounded-lg">
              <FaExclamationTriangle />
              <span className="text-sm">
                {t("courses.certificateCheckWarning", "Certificate check warning")}
              </span>
            </div>
          )}

          {/* Certificate Display */}
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
                <FaAward className="text-secondary" />
                <span>{t("courses.generatingPreview", "Generating professional preview...")}</span>
              </div>
              <div className="flex items-center justify-center w-full aspect-[1.41/1] bg-surface-variant rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary" />
                  <p className="text-text-muted">{t("courses.pleaseWait", "Please wait while we prepare your certificate...")}</p>
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

// ظظظظ
 
