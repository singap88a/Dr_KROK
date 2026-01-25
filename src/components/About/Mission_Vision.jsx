import React, { useState, useEffect } from "react";
import { FiTarget, FiEye } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";

// Mission_Vision.jsx
// Responsive two-column layout for Mission & Vision
// Tailwind CSS required. Uses framer-motion for subtle entrance animation.

export default function Mission_Vision() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const [missionVisionData, setMissionVisionData] = useState(null);

  useEffect(() => {
    const fetchMissionVisionData = async () => {
      try {
        const result = await request('setting');
        if (result && result.data) {
          setMissionVisionData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch mission vision settings:", error);
      }
    };

    fetchMissionVisionData();
  }, [request, i18n.language]); // Add i18n.language dependency to refetch when language changes

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="mb-8 text-2xl font-bold text-center sm:text-3xl text-cyan-900 dark:text-white">
          {t('missionVision.title')}
        </h2>

        {/* Mission & Vision Cards */}
        <div className="grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
          <div className="p-6 transition-all duration-300 border border-gray-200 shadow-lg sm:p-8 rounded-2xl bg-surface hover:shadow-2xl hover:transform hover:scale-105">
           <div className="flex items-center   gap-3">
            <FiTarget size={40} className="mb-4 text-primary animate-pulse" />
            <h3 className="mb-3 text-xl font-semibold sm:text-2xl text-cyan-900 dark:text-white">
              {t('missionVision.mission.title')}
            </h3>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              {missionVisionData?.description_our_mission || t('missionVision.mission.description')}
            </p>
          </div>

          <div className="p-6 transition-all duration-300 border border-gray-200 shadow-lg sm:p-8 rounded-2xl bg-surface hover:shadow-2xl hover:transform hover:scale-105">
           <div className="flex items-center   gap-3">
            <FiEye size={40} className="mb-4 text-primary animate-pulse" />
           
            <h3 className="mb-3 text-xl font-semibold sm:text-2xl text-cyan-900 dark:text-white">
              {t('missionVision.vision.title')}
            </h3>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              {missionVisionData?.description_our_vision || t('missionVision.vision.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
