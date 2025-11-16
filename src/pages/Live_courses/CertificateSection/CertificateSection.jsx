// CertificateSection/CertificateSection.jsx
import React from "react";
import { FaAward } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../context/ApiContext";

export const CertificateSection = ({ id, isLoggedIn }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getLiveCourseProgressDetails } = useApi();
  const [courseProgress, setCourseProgress] = React.useState(null);

  React.useEffect(() => {
    if (isLoggedIn) {
      const loadProgress = async () => {
        try {
          const progress = await getLiveCourseProgressDetails(id);
          setCourseProgress(progress);
        } catch (error) {
          console.error("Error loading course progress:", error);
        }
      };
      loadProgress();
    }
  }, [id, isLoggedIn, getLiveCourseProgressDetails]);

  if (!isLoggedIn || !courseProgress?.overall?.percentage >= 100) {
    return null;
  }

  return (
    <div className="p-4 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-700">
      <button
        onClick={() => navigate(`/live-courses/${id}/certificate`)}
        className="flex items-center w-full gap-3 p-2 text-left transition-all rounded hover:bg-green-100 dark:hover:bg-green-800/50"
      >
        <div className="flex-shrink-0 p-2 bg-green-100 rounded-full dark:bg-green-800">
          <FaAward className="text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-green-800 dark:text-green-200">
            {t("courses.certificate", "Certificate of Completion")}
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            {t("courses.downloadCertificate", "Download your certificate")}
          </p>
        </div>
      </button>
    </div>
  );
};
