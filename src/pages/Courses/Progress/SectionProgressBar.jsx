import React from "react";
import { useTranslation } from "react-i18next";

const SectionProgressBar = ({ 
  sectionId, 
  sectionProgress, 
  calculateSectionProgress 
}) => {
  const { t } = useTranslation();
  
  const progress = calculateSectionProgress ? 
    calculateSectionProgress(sectionId) : 
    { percentage: 0, completedLessons: 0, totalLessons: 0 };
  
  const sectionProgressData = sectionProgress?.[sectionId];

  const displayPercentage =
    sectionProgressData?.percentage || progress.percentage;
  const displayCompleted =
    sectionProgressData?.completed_lessons || progress.completedLessons;
  const displayTotal =
    sectionProgressData?.total_lessons || progress.totalLessons;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="text-text-muted">
          {t("courses.sectionProgress", "Section Progress")}
        </span>
        <span className="font-medium">{displayPercentage}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-accent">
        <div
          className={`h-1.5 rounded-full ${
            displayPercentage === 100 ? "bg-green-500" : "bg-primary"
          }`}
          style={{
            width: `${Math.min(100, Math.max(0, displayPercentage))}%`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span>
          {displayCompleted} of {displayTotal}{" "}
          {t("courses.lessons", "lessons")} completed
        </span>
        {displayPercentage === 100 && (
          <span className="font-semibold text-green-600">
            {t("courses.completed", "Completed")}
          </span>
        )}
      </div>
    </div>
  );
};

export default SectionProgressBar;