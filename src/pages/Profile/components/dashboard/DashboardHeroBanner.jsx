import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaGraduationCap,
  FaBuilding,
  FaCalendarAlt,
  FaUserCheck,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

export default function DashboardHeroBanner({ user, setActiveTab, isRtl }) {
  const { t } = useTranslation();

  const universityName =
    user?.university?.name ||
    (typeof user?.university === "string" ? user.university : null) ||
    t("profile.dashboard.notSpecified", "Not specified");
  const collegeYear =
    user?.college_year || t("profile.dashboard.notSpecified", "Not specified");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-6 sm:p-8 shadow-lg border border-primary/20">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider border border-white/15">
            <FaGraduationCap className="text-xs text-white/90" />
            <span>{t("profile.dashboard.studentSpace", "Student Space")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t("profile.dashboard.welcomeBack", "Welcome back,")}{" "}
            <span>{user?.name || t("profile.dashboard.student", "Dear Student")}</span>
          </h1>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed">
            {t(
              "profile.dashboard.heroDesc",
              "Track your live lecture schedule and learning progress seamlessly in one place."
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/15 text-white">
              <FaBuilding className="text-white/70 text-xs" />
              <span className="text-white/75">{t("profile.dashboard.university", "University")}:</span>
              <strong className="font-semibold text-white">{universityName}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/15 text-white">
              <FaCalendarAlt className="text-white/70 text-xs" />
              <span className="text-white/75">{t("profile.dashboard.year", "Academic Year")}:</span>
              <strong className="font-semibold text-white">{collegeYear}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab("profile")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary hover:bg-white/95 font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
          >
            <FaUserCheck className="text-sm" />
            <span>{t("profile.dashboard.viewProfile", "My Profile")}</span>
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-sm rounded-xl backdrop-blur-sm transition-all duration-150"
          >
            <span>{t("profile.dashboard.myCoursesBtn", "Enrolled Courses")}</span>
            {isRtl ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
          </button>
        </div>
      </div>
    </div>
  );
}
