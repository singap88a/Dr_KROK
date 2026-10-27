import React from "react";
import { FaPlay } from "react-icons/fa";

export default function CourseHeroMedia({
  videoUrl,
  videoRef,
  imageUrl,
  isPlaying,
  handlePlay,
  handleVideoEnd,
  title,
}) {
  return (
    <div className="relative w-full h-[500px] overflow-hidden shadow-lg rounded-2xl lg:mx-0">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="object-cover w-full h-full"
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
          className="object-cover w-full h-full"
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
    </div>
  );
}
