import React from "react";
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LessonAttachments } from "./LessonAttachments";
import LessonHomeworkSection from "../Homework/LessonHomeworkSection";
import LessonInteractions from "../LessonInteractions";
import { LiveActiveSessionCard } from "./LiveSessionStatus";

export default function LessonPlayerTabs({
  tabs,
  activeTab,
  setActiveTab,
  currentLesson,
  currentSection,
  isLiveCourse,
  groupId,
  hasAccess,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  hasAttachments,
  essayQuestions,
  essayLoading,
  recreationalQuizzes,
  recreationalForbidden,
  recreationalForbiddenMessage,
  recreationalLoading,
  flashcardsCount,
  flashcardsLoading,
  setShowPurchaseModal,
  onImageClick,
  onFileClick,
  onVideoClick,
  lessonStatuses,
  id,
  course,
  formatSessionTimeRaw,
  isLinkActive,
  getTimeUntilStart,
  serverTimeOffset,
  currentTimeMs,
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* ── Tab Bar Navigation ── */}
      <div className="relative flex flex-wrap bg-gray-100/60 dark:bg-gray-800/40 p-1.5 rounded-2xl my-6 gap-1 border border-border/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors duration-300 whitespace-nowrap outline-none select-none cursor-pointer ${
                isActive
                  ? "text-white animate-in scale-in-95 duration-100"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {isActive && (
                <Motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-primary rounded-xl"
                  style={{ originY: "0px" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge !== null && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-black rounded-full leading-none ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Contents ── */}
      <div className="mt-4 animate-in fade-in duration-300">
        {activeTab === "about" && (
          <div className="space-y-4">
            {/* Session description */}
            {(currentLesson?.description || currentSection?.description) && (
              <div className="text-sm text-text-secondary">
                <div
                  className={`leading-relaxed ${!isDescriptionExpanded ? "line-clamp-6" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: currentLesson?.description || currentSection?.description,
                  }}
                />
                {(currentLesson?.description || currentSection?.description || "").length > 250 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-2 text-sm font-semibold underline text-primary hover:text-primary/80 cursor-pointer"
                  >
                    {isDescriptionExpanded ? t("common.showLess", "Show Less") : t("common.showMore", "Show More")}
                  </button>
                )}
              </div>
            )}

            {/* Live Session Schedule & Join Link */}
            {isLiveCourse && (
              <LiveActiveSessionCard
                currentLesson={currentLesson}
                currentSection={currentSection}
                isLiveCourse={isLiveCourse}
                formatSessionTimeRaw={formatSessionTimeRaw}
                isLinkActive={isLinkActive}
                getTimeUntilStart={getTimeUntilStart}
                serverTimeOffset={serverTimeOffset}
                currentTimeMs={currentTimeMs}
              />
            )}
          </div>
        )}

        {activeTab === "attachments" && hasAttachments && (
          <LessonAttachments
            content={currentLesson || currentSection}
            setSelectedImage={onImageClick}
            setShowImagePopup={() => {}}
            handleFileClick={onFileClick}
            handleVideoClick={onVideoClick}
          />
        )}

        {activeTab === "homework" && currentLesson && (
          <LessonHomeworkSection
            currentLesson={currentLesson}
            course={course}
            id={id}
            isLiveCourse={isLiveCourse}
            hasAccess={hasAccess}
            lessonStatuses={lessonStatuses}
            setShowPurchaseModal={setShowPurchaseModal}
            essayQuestions={essayQuestions}
            essayLoading={essayLoading}
            recreationalQuizzes={recreationalQuizzes}
            recreationalForbidden={recreationalForbidden}
            recreationalForbiddenMessage={recreationalForbiddenMessage}
            recreationalLoading={recreationalLoading}
            flashcardsCount={flashcardsCount}
            flashcardsLoading={flashcardsLoading}
          />
        )}

        {activeTab === "comments" && currentLesson && (
          <div className="mt-4">
            <LessonInteractions
              key={`full-${currentLesson.id}`}
              lessonId={currentLesson.id}
              batchLessonId={currentLesson.batch_lesson_id}
              isLiveCourse={isLiveCourse}
              groupId={groupId}
              mode="full"
              hasAccess={hasAccess}
            />
          </div>
        )}
      </div>
    </>
  );
}
