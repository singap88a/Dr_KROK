import React, { useState, useEffect } from "react";
import { FiPlay, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";

// OurStory.jsx
// Responsive, modern two-column layout: left = content, right = video (modal player)
// Tailwind CSS required. Uses framer-motion for subtle entrance animation.

export default function OurStory() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const { isLoggedIn } = useUser();
  const [storyData, setStoryData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const result = await request("setting");
        if (result && result.data) {
          setStoryData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch story settings:", error);
      }
    };

    fetchStoryData();
  }, [request, i18n.language]); // Add i18n.language dependency to refetch when language changes

  return (
    <section className="px-4 py-12 transition-colors sm:py-16 lg:py-20">
      <div className="grid items-center grid-cols-1 gap-12 mx-auto max-w-7xl lg:grid-cols-2">
        {/* LEFT: Content */}
        <div className="px-4 space-y-6 sm:px-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 border rounded-full shadow-sm bg-white/60 dark:bg-white/5 backdrop-blur-sm border-white/30">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
              {t("ourStory.badge")}
            </span>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl text-cyan-900 dark:text-white">
            {t("ourStory.title")}
          </h2>

          <p className="max-w-2xl text-lg text-cyan-800 dark:text-cyan-200">
            {t("ourStory.subtitle")}
          </p>

          <div
            className={`max-w-2xl text-base leading-relaxed text-gray-700 dark:text-gray-300 ${!isExpanded ? 'line-clamp-4' : ''}`}
            dangerouslySetInnerHTML={{
              __html:
                storyData?.description_about_us_Our_Story ||
                t("ourStory.description"),
            }}
          />
          {(storyData?.description_about_us_Our_Story || t("ourStory.description"))?.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 font-medium underline text-primary hover:text-primary/80"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}

          <ul className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-cyan-700 dark:text-cyan-300">
                <FiCheckCircle className="w-5 h-5" />
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {t("ourStory.features.expertInstructors")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-cyan-700 dark:text-cyan-300">
                <FiCheckCircle className="w-5 h-5" />
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {t("ourStory.features.handsOnProjects")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-cyan-700 dark:text-cyan-300">
                <FiCheckCircle className="w-5 h-5" />
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {t("ourStory.features.communitySupport")}
              </span>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            {!isLoggedIn ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-5 py-3 font-medium text-white transition transform rounded-lg shadow bg-cyan-700 hover:scale-105"
              >
                {t("ourStory.buttons.getStarted")}
              </Link>
            ) : (
              <Link
                to="/courses"
                className="inline-flex items-center gap-3 px-5 py-3 font-medium text-white transition transform rounded-lg shadow bg-cyan-700 hover:scale-105"
              >
                {t("ourStory.buttons.goToCourses")}
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT: Video */}
        <div className="px-4 sm:px-6">
          <div className="relative overflow-hidden border shadow-xl rounded-xl bg-gradient-to-br from-white/80 to-cyan-50 border-white/50 dark:from-gray-800/60 dark:to-gray-900/60">
            <video
              controls
              poster={
                storyData?.image_banner_page_about ||
                "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b8f2d6b6c9f8a3f6b3a2f4b1e2c3d4e"
              }
              src={
                storyData?.video_page_about ||
                "https://www.w3schools.com/html/mov_bbb.mp4"
              }
              className="w-full h-[320px] sm:h-[420px] object-cover bg-black"
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            >
              Sorry, your browser doesn't support embedded videos.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
