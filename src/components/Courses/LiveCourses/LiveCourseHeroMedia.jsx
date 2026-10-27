import React from "react";
import { FaPlay } from "react-icons/fa";

export default function LiveCourseHeroMedia({
  videoUrl,
  videoRef,
  imageUrl,
  isPlaying,
  handlePlay,
  handleVideoEnd,
  title,
  timeStatus,
  t,
}) {
  return (
    <div className="relative w-full overflow-hidden shadow-lg rounded-2xl lg:mx-0 h-fit lg:self-start">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="object-cover w-full h-[400px]"
          muted
          playsInline
          controls={isPlaying}
          onEnded={handleVideoEnd}
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <img
          src={imageUrl}
          alt={title}
          className="object-cover w-full h-[500px]"
        />
      )}
      {!isPlaying && videoUrl && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50"
          onClick={handlePlay}
        >
          <FaPlay className="text-4xl text-white drop-shadow-lg sm:text-5xl" />
        </div>
      )}
      {/* Live Badge */}
      <div className="absolute z-10 top-4 left-4">
        <div className="flex items-center gap-1 px-3 py-1 text-white rounded-full shadow-lg bg-gradient-to-r from-[#E11D48] to-[#F97316]">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs font-bold">
            {t("liveCourses.live", "LIVE")}
          </span>
        </div>
      </div>
      {/* Time Status Badge */}
      {timeStatus && (
        <div className="absolute z-10 top-4 right-4">
          <div
            className={`px-3 py-1 text-xs font-semibold text-white rounded-full shadow-lg ${timeStatus.color}`}
          >
            {t(`liveCourses.${timeStatus.status}`, timeStatus.text)}
          </div>
        </div>
      )}
    </div>
  );
}
