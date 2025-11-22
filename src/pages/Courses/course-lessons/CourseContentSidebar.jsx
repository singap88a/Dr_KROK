import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaAward, FaLock } from "react-icons/fa";
import SectionItem from "../SectionItem";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";

const CourseContentSidebar = ({
  sections,
  course,
  courseProgress,
  expandedSections,
  currentLesson,
  currentSection,
  lessonStatuses,
  hasAccess,
  isLoggedIn,
  sectionProgress,
  calculateTotalProgress,
  calculateSectionProgress,
  onLessonClick,
  onSectionClick,
  onToggleSection,
  hasFreeLessons,
  navigate
}) => {
  const { t } = useTranslation();
  const { getCertificateFile, getAuthToken, checkCertificateExists } = useApi();
  
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [checkingCertificate, setCheckingCertificate] = useState(false);

  // التحقق من وجود الشهادة في السيرفر فقط
  useEffect(() => {
    const checkCertificateEligibility = async () => {
      if (!isLoggedIn || !course?.id) {
        setCertificateEligible(false);
        return;
      }
      
      try {
        setCheckingCertificate(true);
        
        const token = getAuthToken();
        if (!token) {
          console.log("❌ No token available for certificate check");
          setCertificateEligible(false);
          setCheckingCertificate(false);
          return;
        }
        
        // التحقق من وجود الشهادة في السيرفر فقط
        const courseType = 'video'; // للفيديو كورس فقط
        console.log(`🔍 Checking certificate for course ${course.id} (type: ${courseType})`);
        
        // استخدام checkCertificateExists للتحقق السريع من وجود الشهادة
        const exists = await checkCertificateExists(token, course.id, courseType);
        
        if (exists) {
          console.log(`✅ Certificate exists on server!`);
          setCertificateEligible(true);
        } else {
          console.log("❌ Certificate not found on server");
          setCertificateEligible(false);
        }
      } catch (error) {
        // إذا لم توجد الشهادة في السيرفر، يعني غير مؤهل
        console.log("❌ Certificate check failed:", error?.message || error);
        setCertificateEligible(false);
      } finally {
        setCheckingCertificate(false);
      }
    };

    checkCertificateEligibility();
  }, [isLoggedIn, course?.id, checkCertificateExists, getAuthToken]);

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [sections]);

  const getSectionLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return [];
      return [...section.lessons].sort((a, b) => {
        const aFree = a.type === "free" || a.type === "Free";
        const bFree = b.type === "free" || b.type === "Free";
        if (aFree && !bFree) return -1;
        if (!aFree && bFree) return 1;
        return (a.id || 0) - (b.id || 0);
      });
    };
  }, [sections]);

  return (
    <div className="space-y-3 lg:col-span-1">
      <h3 className="text-lg font-semibold">
        {t("courses.courseContent", "Course Content")}
      </h3>

      <div className="space-y-2">
        {sortedSections.map((section) => (
          <SectionItem
            key={`section-${section.id}`}
            section={section}
            lessons={getSectionLessons(section.id)}
            isExpanded={expandedSections.has(section.id)}
            isActive={currentSection?.id === section.id}
            hasFree={hasFreeLessons(section.id)}
            isAccessible={hasFreeLessons(section.id) || hasAccess}
            lessonStatuses={lessonStatuses}
            currentLesson={currentLesson}
            sectionProgress={sectionProgress}
            calculateTotalProgress={calculateTotalProgress}
            calculateSectionProgress={calculateSectionProgress}
            onSectionClick={onSectionClick}
            onLessonClick={onLessonClick}
            onToggleSection={onToggleSection}
            isLoggedIn={isLoggedIn}
            navigate={navigate}
            course={course}
          />
        ))}

        {course.final_tests && course.final_tests.length > 0 && (
          <div className="p-4 mt-4 border rounded-lg bg-surface border-border">
            <div className="mb-2 text-sm font-semibold text-text">
              {t("courses.finalTests", "Final Tests")}
            </div>
            <div className="flex flex-wrap gap-2">
              {course.final_tests.map((test, idx) => {
                // تعديل شرط القفل: يكون مفتوح إذا كان الطالب عنده access للكورس
                const locked = !hasAccess;
                return (
                  <button
                    key={test.id || idx}
                    onClick={() =>
                      !locked &&
                      navigate(`/courses/${course.id}/test/final/${test.id}`, {
                        state: { course, test },
                      })
                    }
                    disabled={locked}
                    className={`px-3 py-2 text-xs font-medium rounded ${
                      locked
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "text-white bg-primary hover:bg-secondary"
                    }`}
                  >
                    {test.name ||
                      `${t("courses.finalTest", "Final Test")} ${idx + 1}`}{" "}
                    {locked && <FaLock className="inline ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* زر الشهادة - الشرط المعدل */}
        {isLoggedIn && certificateEligible && (
          <div className="p-4 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-700">
            <button
              onClick={() => navigate(`/courses/${course.id}/certificate`)}
              disabled={checkingCertificate}
              className="flex items-center w-full gap-3 p-2 text-left transition-all rounded hover:bg-green-100 dark:hover:bg-green-800/50 disabled:opacity-50"
            >
              <div className="flex-shrink-0 p-2 bg-green-100 rounded-full dark:bg-green-800">
                <FaAward className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  {t("courses.certificate", "Certificate of Completion")}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {checkingCertificate 
                    ? t("courses.checkingEligibility", "Checking eligibility...") 
                    : t("courses.downloadCertificate", "Download your certificate")
                  }
                </p>
              </div>
            </button>
          </div>
        )}

        {/* رسالة إذا كان يتحقق من الأهلية */}
        {checkingCertificate && (
          <div className="p-3 mt-4 text-center border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t("courses.checkingCertificate", "Checking certificate availability...")}
            </p>
          </div>
        )}

        {/* رسالة إذا كان غير مؤهل - تظهر فقط إذا كان عنده final tests متاحة */}
        {isLoggedIn && 
         hasAccess && 
         !certificateEligible && 
         !checkingCertificate && 
         course?.final_tests && 
         course.final_tests.length > 0 && (
          <div className="p-4 mt-4 border border-amber-200 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full dark:bg-amber-800">
                <FaAward className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {t("courses.certificateNotAvailable", "Certificate Not Available Yet")}
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {t("courses.takeFinalTest", "Complete the final test and score 65% or higher to unlock your certificate")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentSidebar;