// LessonPlayer/VideoPlayer.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaVideo, FaPlay, FaExpand, FaCompress } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import { useUser } from "../../../context/UserContext";

/**
 * VideoWatermark – renders dynamic, highly visible watermark labels
 * over the video. Shows the student's name and email separately.
 * Swaps positions between top and bottom every 60 seconds.
 */
const VideoWatermark = () => {
  const { userData } = useUser();
  const [isSwapped, setIsSwapped] = useState(false);

  // Swap positions every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwapped((prev) => !prev);
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (!userData?.name && !userData?.email) return null;

  // Safe positions: Extreme Top-Right and Bottom-Right (or Left) to avoid slide text in center
  const posTop = { top: "4%", right: "2%" };
  const posBottom = { bottom: "15%", left: "2%" }; // Left side to balance out

  const commonStyle = {
    position: "absolute",
    transition: "all 1.5s ease-in-out",
    fontSize: "clamp(10px, 1.2vw, 14px)",
    fontWeight: 600,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    letterSpacing: "0.05em",
    color: "rgba(255, 255, 255, 0.95)", // Clean white text
    backgroundColor: "rgba(0, 0, 0, 0.45)", // Semi-transparent black pill
    border: "1px solid rgba(255, 255, 255, 0.1)", // Subtle border to make it pop
    backdropFilter: "blur(4px)",
    padding: "5px 12px",
    borderRadius: "8px",
    pointerEvents: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    zIndex: 20,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {userData?.email && (
        <div style={{ ...commonStyle, ...(isSwapped ? posBottom : posTop) }}>
          {userData.email}
        </div>
      )}
      {userData?.name && (
        <div style={{ ...commonStyle, ...(isSwapped ? posTop : posBottom) }}>
          {userData.name}
        </div>
      )}
    </div>
  );
};

export const VideoPlayer = ({ 
  currentLesson, 
  currentSection, 
  handleVideoTimeUpdate, 
  handleVideoEnd 
}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => console.warn(err));
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (videoRef.current && videoRef.current.webkitEnterFullscreen) {
        // Fallback for iOS
        videoRef.current.webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#000" }} className="group">
      <video
        ref={videoRef}
        src={videoSrc.includes('#t=') ? videoSrc : `${videoSrc}#t=0.001`}
        preload="metadata"
        controls
        className="w-full h-full custom-video-player"
        poster={currentLesson?.image || currentSection?.images?.[0] || undefined}
        onTimeUpdate={handleVideoTimeUpdate}
        onEnded={handleVideoEnd}
        controlsList="nodownload nofullscreen"
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* Anti-piracy watermark overlay */}
      <VideoWatermark />

      {/* Custom Fullscreen Button */}
      <button 
        onClick={toggleFullscreen} 
        className="absolute bottom-16 right-4 z-[60] p-2.5 text-white bg-black/50 hover:bg-black/80 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
      </button>
    </div>
  );
};