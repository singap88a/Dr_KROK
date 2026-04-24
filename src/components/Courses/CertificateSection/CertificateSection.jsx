// CertificateSection/CertificateSection.jsx
import React from "react";
import { FaAward } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../context/ApiContext";

export const CertificateSection = ({ id, isLoggedIn }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkCertificateExists, getAuthToken } = useApi();
  const [certificateEligible, setCertificateEligible] = React.useState(false);
  const [checkingCertificate, setCheckingCertificate] = React.useState(false);

  React.useEffect(() => {
    const checkCertificateEligibility = async () => {
      if (!isLoggedIn || !id) {
        setCertificateEligible(false);
        return;
      }
      
      try {
        setCheckingCertificate(true);
        
        const token = getAuthToken();
        if (!token) {
          setCertificateEligible(false);
          setCheckingCertificate(false);
          return;
        }
        
        // التحقق من وجود الشهادة في السيرفر
        const courseType = 'live'; // للايف كورس
        const exists = await checkCertificateExists(token, id, courseType);
        
        setCertificateEligible(exists);
      } catch (error) {
        console.log("No certificate found on server");
        setCertificateEligible(false);
      } finally {
        setCheckingCertificate(false);
      }
    };

    checkCertificateEligibility();
  }, [id, isLoggedIn, checkCertificateExists, getAuthToken]);

  if (!isLoggedIn || !certificateEligible || checkingCertificate) {
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
