import React from "react";
import { useTranslation } from "react-i18next";
import { FaVideo, FaBook, FaCheckCircle } from "react-icons/fa";

export default function DashboardQuickShortcuts({ setActiveTab }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        onClick={() => setActiveTab("courses")}
        className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
          <FaVideo />
        </div>
        <h4 className="font-bold text-text text-sm mb-1">
          {t("profile.dashboard.continueCourses", "Continue Courses")}
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          {t("profile.dashboard.continueCoursesDesc", "Watch recorded lectures and test your knowledge.")}
        </p>
      </button>

      <button
        onClick={() => setActiveTab("materials")}
        className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
          <FaBook />
        </div>
        <h4 className="font-bold text-text text-sm mb-1">
          {t("profile.dashboard.materialsLibrary", "Materials & Question Bank")}
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          {t("profile.dashboard.materialsLibraryDesc", "Browse and download your KROK summaries and files.")}
        </p>
      </button>

      <button
        onClick={() => setActiveTab("profile")}
        className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
          <FaCheckCircle />
        </div>
        <h4 className="font-bold text-text text-sm mb-1">
          {t("profile.dashboard.accountSettings", "Account Settings & Info")}
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          {t("profile.dashboard.accountSettingsDesc", "Update phone, university, and academic year.")}
        </p>
      </button>
    </div>
  );
}
