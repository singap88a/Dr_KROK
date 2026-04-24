// LessonPlayer/LessonAttachments.jsx
import React from "react";
import { FaFileAlt, FaVideo, FaImage, FaWhatsapp, FaPlay } from "react-icons/fa"; // إضافة FaPlay هنا
import { useTranslation } from "react-i18next";
import InlinePDFViewer from "../ContentModals/InlinePDFViewer";

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
        <div className="mb-6">
          <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text">
            <FaImage className="text-primary" />
            {t("courses.images", "Gallery")}
          </h5>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {content.images.map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden transition-transform duration-200 transform rounded-lg cursor-pointer group hover:scale-105"
                onClick={() => {
                  setSelectedImage(img);
                  setShowImagePopup(true);
                }}
              >
                <img
                  src={img}
                  alt={`${type} image ${idx + 1}`}
                  className="object-cover w-full rounded-lg h-28"
                />
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 group-hover:bg-opacity-30">
                  <div className="transition-all duration-200 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
                    <FaImage className="text-xl text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

 
      {content.files && content.files.length > 0 && (
        <div className="mb-6">
          <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text">
            <FaFileAlt className="text-primary" />
            {t("courses.files", "Study Materials")}
          </h5>
          <div className="grid grid-cols-1 gap-6">
            {content.files.map((file, idx) => {
              const fileUrl = file.url || file;
              const fileName = file.name || `${t("courses.file", "File")} ${idx + 1}`;
              
              const isPDF = typeof fileUrl === 'string' && fileUrl.toLowerCase().endsWith('.pdf');
              
              return (
                <div key={idx}>
                  {isPDF ? (
                    <div>
                      <h6 className="mb-3 text-base font-semibold text-text">
                        {fileName}
                      </h6>
                      <InlinePDFViewer url={fileUrl} fileName={fileName} />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileClick(fileUrl)}
                      className="flex items-center gap-4 p-4 transition-all border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md group"
                    >
                      <div className="flex-shrink-0 p-3 transition-colors rounded-lg bg-primary/10 group-hover:bg-primary/20">
                        <FaFileAlt className="text-xl text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="block text-sm font-medium text-text">
                          {fileName}
                        </span>
                        <span className="block mt-1 text-xs text-text-muted">
                          {t("courses.clickToDownload", "Click to download")}
                        </span>
                      </div>
                    </button>
                  )
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Videos */}
      {content.video_related && (
        <div className="mb-6">
          <h5 className="flex items-center gap-2 mb-3 text-lg font-semibold text-text">
            <FaVideo className="text-primary" />
            {t("courses.additionalVideos", "Additional Videos")}
          </h5>
          <div className="grid grid-cols-1 gap-4">
            {getVideoRelatedArray(content.video_related).map((video, idx) => {
              const isObj = typeof video === "object" && video !== null;
              const videoUrl = isObj ? video.url || video.src || video.video || "" : video;
              const thumbnail = isObj ? video.thumbnail || video.poster || video.image || "" : "";
              
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 transition-all border-2 border-gray-200 cursor-pointer rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md group"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={`Additional video ${idx + 1}`}
                        className="object-cover w-full h-full transition-transform group-hover:scale-110"
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
                    <div className="absolute inset-0 flex items-center justify-center transition-all bg-black/0 group-hover:bg-black/20">
                      <div className="flex items-center justify-center w-8 h-8 transition-transform transform bg-white rounded-full bg-opacity-90 group-hover:scale-110">
                        <FaPlay className="text-gray-700 text-xs ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text">
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