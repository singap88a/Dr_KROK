// LessonPlayer/VideoPlayer.jsx
import React from "react";
import { FaVideo, FaPlay } from "react-icons/fa"; // إضافة FaPlay هنا
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

export const VideoPlayer = ({ 
  currentLesson, 
  currentSection, 
  handleVideoTimeUpdate, 
  handleVideoEnd 
}) => {
  const { t } = useTranslation();

  const videoSrc = currentLesson?.video || currentSection?.video;

  if (!videoSrc) {
    const fallbackImage = currentLesson?.image || currentSection?.images?.[0] || "/logo.png";
    return (
      <div className="relative w-full h-full group overflow-hidden">
        {/* Background Image Fallback */}
        <img 
          src={fallbackImage} 
          alt="Unit Preview" 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Semi-transparent Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
          <div className="text-center p-6 transform transition-all duration-500 hover:scale-105">
            <div className="relative mb-4 inline-block">
              <FaVideo className="text-5xl text-white/30" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Unit Content
            </h3>
            <p className="text-white/80 max-w-xs mx-auto text-sm leading-relaxed">
              {t("courses.noIntroVideo", "No introductory video for this unit currently. You can browse the files and attachments below.")}
            </p>
          </div>
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
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};