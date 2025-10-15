import React from "react";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";

const VideoPopup = ({ show, video, onClose }) => {
  const { t } = useTranslation();

  if (!show || !video) return null;

  const videoUrl = typeof video === "object" && video !== null 
    ? video.url || video.src || video.video || video
    : video;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl p-4 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">
            {t("courses.additionalVideo", "Additional Video")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={t("common.close", "Close")}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        <div className="aspect-video">
          <video
            src={videoUrl}
            controls
            className="w-full h-full rounded"
            autoPlay
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPopup;