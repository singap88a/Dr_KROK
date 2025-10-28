// LessonPlayer/VideoPlayer.jsx
import React from "react";
import { FaVideo, FaPlay } from "react-icons/fa"; // إضافة FaPlay هنا
import { useTranslation } from "react-i18next";

export const VideoPlayer = ({ 
  currentLesson, 
  currentSection, 
  handleVideoTimeUpdate, 
  handleVideoEnd 
}) => {
  const { t } = useTranslation();

  const videoSrc = currentLesson?.video || currentSection?.video;

  if (!videoSrc) {
    return (
      <div className="flex items-center justify-center h-full bg-accent">
        <div className="text-center">
          <FaVideo className="mx-auto mb-2 text-4xl text-text-muted" />
          <p className="text-text-muted">
            {t("courses.videoNotAvailable", "Video not available")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <video
      src={videoSrc}
      controls
      className="w-full h-full"
      poster={currentLesson?.image || currentSection?.images?.[0]}
      onTimeUpdate={handleVideoTimeUpdate}
      onEnded={handleVideoEnd}
    />
  );
};