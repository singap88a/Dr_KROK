// LessonPlayer/LessonAttachments.jsx
import React from "react";
import { FaFileAlt, FaVideo, FaImage, FaWhatsapp, FaPlay } from "react-icons/fa"; // إضافة FaPlay هنا
import { useTranslation } from "react-i18next";

export const LessonAttachments = ({ 
  content, 
  setSelectedImage, 
  setShowImagePopup, 
  handleFileClick, 
  handleVideoClick,
  type = "lesson"
}) => {
  const { t } = useTranslation();

  if (!content) return null;

  const getVideoRelatedArray = (videoRelated) => {
    if (!videoRelated) return [];
    if (Array.isArray(videoRelated)) return videoRelated;
    return [videoRelated];
  };

  const hasAttachments = 
    (content.images && content.images.length > 0) ||
    (content.files && content.files.length > 0) ||
    (content.video_related && content.video_related.length > 0);

  if (!hasAttachments) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-3 font-semibold text-md text-text">
        {type === "lesson" 
          ? t("courses.lessonAttachments", "Lesson Attachments")
          : t("courses.sectionAttachments", "Section Attachments")
        }
      </h4>

      {/* Image Gallery */}
      {content.images && content.images.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-2 text-sm font-medium text-text">
            {t("courses.images", "Images")}
          </h5>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {content.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${type} image ${idx + 1}`}
                className="object-cover w-full h-32 rounded cursor-pointer"
                style={{
                  width: "100%",
                  height: "128px",
                  objectFit: "cover",
                }}
                onClick={() => {
                  setSelectedImage(img);
                  setShowImagePopup(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* File Gallery */}
      {content.files && content.files.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-2 text-sm font-medium text-text">
            {t("courses.files", "Files")}
          </h5>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {content.files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => handleFileClick(file.url || file)}
                className="flex flex-col items-center p-3 transition-colors border rounded hover:bg-accent"
              >
                <FaFileAlt className="mb-2 text-2xl text-primary" />
                <span className="text-xs text-center text-text">
                  {file.name || `${t("courses.file", "File")} ${idx + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Videos */}
      {content.video_related && (
        <div className="mb-4">
          <h5 className="mb-2 text-sm font-medium text-text">
            {t("courses.additionalVideos", "Additional Videos")}
          </h5>
          <div className="grid grid-cols-1 gap-3">
            {getVideoRelatedArray(content.video_related).map((video, idx) => {
              const isObj = typeof video === "object" && video !== null;
              const videoUrl = isObj ? video.url || video.src || video.video || "" : video;
              const thumbnail = isObj ? video.thumbnail || video.poster || video.image || "" : "";
              
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 transition-all border rounded-lg cursor-pointer group hover:bg-accent hover:border-primary/50"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={`Additional video ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        className="object-cover w-full h-full"
                        muted
                        playsInline
                        preload="metadata"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full bg-opacity-90">
                        <FaPlay className="text-gray-700 text-xs ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FaVideo className="text-sm text-primary" />
                      <span className="text-sm font-medium text-text">
                        {t("courses.additionalVideo", "Additional Video")} {idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      {t("courses.clickToWatch", "Click to watch this video")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ask the Instructor */}
      {type === "lesson" && content.instructor && content.instructor.whatsapp && (
        <div className="p-3 mt-4 border rounded-lg bg-surface border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900">
              <FaWhatsapp className="text-lg text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-text">
                {t("courses.askInstructor", "Ask the Instructor")}
              </h4>
              <a
                href={`https://wa.me/${content.instructor.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:text-green-700"
              >
                {t("courses.contactInstructor", "Contact Instructor")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};