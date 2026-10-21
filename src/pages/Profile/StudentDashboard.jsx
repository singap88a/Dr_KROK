import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaGraduationCap,
  FaBroadcastTower,
  FaBook,
  FaShoppingCart,
  FaCalendarAlt,
  FaClock,
  FaUserCheck,
  FaArrowRight,
  FaArrowLeft,
  FaVideo,
  FaExclamationCircle,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaChevronRight,
  FaBuilding,
} from "react-icons/fa";

export default function StudentDashboard({ user, setActiveTab }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar" || i18n.dir?.() === "rtl";
  const [filterType, setFilterType] = useState("all"); // "all" | "live" | "video"

  // University & year display helpers
  const universityName =
    user?.university?.name ||
    (typeof user?.university === "string" ? user.university : null) ||
    t("profile.dashboard.notSpecified", "غير محدد");
  const collegeYear = user?.college_year || t("profile.dashboard.notSpecified", "غير محدد");

  // Sample schedule structure ready to be plugged into backend API data
  const sampleSchedule = [
    {
      id: "lec-1",
      title: "KROK 1 - Clinical Pharmacology Review & High-Yield MCQs",
      courseType: "live",
      courseName: "KROK 1 Comprehensive Live Course",
      instructor: "Dr. KROK Medical Team",
      date: "2026-10-25",
      time: "18:00 - 20:00 (EET)",
      status: "upcoming", // upcoming | live | completed
      isLiveNow: false,
    },
    {
      id: "lec-2",
      title: "Pathophysiology & Disease Mechanisms Live Q&A",
      courseType: "live",
      courseName: "Pathology & Pathophysiology Masterclass",
      instructor: "Senior Medical Lecturer",
      date: "2026-10-27",
      time: "19:30 - 21:00 (EET)",
      status: "upcoming",
      isLiveNow: false,
    },
    {
      id: "lec-3",
      title: "Microbiology & Immunology Discussion Session",
      courseType: "video",
      courseName: "Medical Microbiology & Virology",
      instructor: "Academic Advisory Board",
      date: "2026-10-30",
      time: "17:00 - 18:30 (EET)",
      status: "upcoming",
      isLiveNow: false,
    },
  ];

  const filteredSchedule = sampleSchedule.filter((item) => {
    if (filterType === "all") return true;
    return item.courseType === filterType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Hero Welcome Banner (Classic Primary) ───────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-6 sm:p-8 shadow-lg border border-primary/20">
        {/* Subtle executive geometric background accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider border border-white/15">
              <FaGraduationCap className="text-xs text-white/90" />
              <span>{t("profile.dashboard.studentSpace", "مساحة الطالب")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t("profile.dashboard.welcomeBack", "مرحباً بك،")}{" "}
              <span>{user?.name || t("profile.dashboard.student", "طالبنا العزيز")}</span>
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              {t(
                "profile.dashboard.heroDesc",
                "هنا يمكنك متابعة جدول محاضراتك المباشرة وتقدمك الدراسي بكل سهولة."
              )}
            </p>

            {/* University & Academic Year Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/15 text-white">
                <FaBuilding className="text-white/70 text-xs" />
                <span className="text-white/75">{t("profile.dashboard.university", "الجامعة")}:</span>
                <strong className="font-semibold text-white">{universityName}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/15 text-white">
                <FaCalendarAlt className="text-white/70 text-xs" />
                <span className="text-white/75">{t("profile.dashboard.year", "السنة الدراسية")}:</span>
                <strong className="font-semibold text-white">{collegeYear}</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab("profile")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary hover:bg-white/95 font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
            >
              <FaUserCheck className="text-sm" />
              <span>{t("profile.dashboard.viewProfile", "الملف الشخصي")}</span>
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-sm rounded-xl backdrop-blur-sm transition-all duration-150"
            >
              <span>{t("profile.dashboard.myCoursesBtn", "كورساتي المسجلة")}</span>
              {isRtl ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Quick Stats Overview ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Courses Stat */}
        <div
          onClick={() => setActiveTab("courses")}
          className="group cursor-pointer p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaGraduationCap />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              {t("profile.dashboard.view", "عرض")}
              <FaChevronRight className="text-[10px]" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">{user?.stats?.courses || 0}</div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.stats.courses", "الكورسات المسجلة")}
            </div>
          </div>
        </div>

        {/* Live Sessions Stat */}
        <div className="p-5 rounded-2xl bg-surface border border-border/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
              <FaBroadcastTower />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              {t("profile.dashboard.liveBadge", "مباشر")}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">3</div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.dashboard.upcomingSessions", "محاضرات لايف قادمة")}
            </div>
          </div>
        </div>

        {/* Study Materials Stat */}
        <div
          onClick={() => setActiveTab("materials")}
          className="group cursor-pointer p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaBook />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              {t("profile.dashboard.view", "عرض")}
              <FaChevronRight className="text-[10px]" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">{user?.materials_count || 0}</div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.sidebar.myMaterials", "المذكرات والمواد")}
            </div>
          </div>
        </div>

        {/* Orders Stat */}
        <div
          onClick={() => setActiveTab("orders")}
          className="group cursor-pointer p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaShoppingCart />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              {t("profile.dashboard.view", "عرض")}
              <FaChevronRight className="text-[10px]" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-text">{user?.stats?.orders || 0}</div>
            <div className="text-xs font-medium text-text-secondary mt-1">
              {t("profile.stats.orders", "الطلبات والمشتريات")}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Live Lectures Schedule Section ──────────────────────────────── */}
      <div className="rounded-3xl bg-surface border border-border/70 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <FaBroadcastTower className="text-lg" />
              </div>
              <h2 className="text-xl font-bold text-text">
                {t("profile.dashboard.scheduleTitle", "مواعيد المحاضرات اللايف")}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              {t(
                "profile.dashboard.scheduleSubtitle",
                "تابع مواعيد وجلسات البث المباشر الخاصة بالكورسات المسجلة لديك."
              )}
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-background rounded-xl border border-border/60 self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {t("profile.dashboard.allLectures", "الكل")}
            </button>
            <button
              onClick={() => setFilterType("live")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "live"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {t("profile.dashboard.liveCoursesFilter", "لايف كورس")}
            </button>
            <button
              onClick={() => setFilterType("video")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "video"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {t("profile.dashboard.videoCoursesFilter", "جلسات نقاش")}
            </button>
          </div>
        </div>

        {/* Schedule Cards List */}
        <div className="space-y-4">
          {filteredSchedule.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-background border border-border/60 hover:border-primary/40 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left/Main Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.courseType === "live"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {item.courseType === "live"
                      ? t("profile.dashboard.liveCourseTag", "كورس مباشر")
                      : t("profile.dashboard.videoCourseTag", "جلسة تفاعلية")}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    {item.courseName}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-text hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                  <span className="flex items-center gap-1.5">
                    <FaChalkboardTeacher className="text-primary" />
                    {item.instructor}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-primary" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-primary" />
                    {item.time}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 shadow-sm"
                  onClick={() => setActiveTab("courses")}
                >
                  {t("profile.dashboard.joinOrDetails", "تفاصيل المحاضرة")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notice for API connection */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3 text-xs sm:text-sm text-text-secondary">
          <FaExclamationCircle className="text-primary text-base shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t(
              "profile.dashboard.syncNotice",
              "سيتم ربط وإظهار كامل جدول مواعيد المحاضرات المباشرة والجلسات الخاصة بك تلقائياً فور تأكيدها وتحديثها من إدارة الأكاديمية."
            )}
          </p>
        </div>
      </div>

      {/* ─── Quick Shortcuts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab("courses")}
          className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
            <FaVideo />
          </div>
          <h4 className="font-bold text-text text-sm mb-1">{t("profile.dashboard.continueCourses", "متابعة الكورسات")}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t("profile.dashboard.continueCoursesDesc", "شاهد المحاضرات المسجلة واختبر معلوماتك.")}
          </p>
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
            <FaBook />
          </div>
          <h4 className="font-bold text-text text-sm mb-1">{t("profile.dashboard.materialsLibrary", "بنك المذكرات والأسئلة")}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t("profile.dashboard.materialsLibraryDesc", "تصفح وحمل ملخصات وملفات KROK الخاصة بك.")}
          </p>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className="p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary text-start transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
            <FaCheckCircle />
          </div>
          <h4 className="font-bold text-text text-sm mb-1">{t("profile.dashboard.accountSettings", "إعدادات الحساب والبيانات")}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t("profile.dashboard.accountSettingsDesc", "تحديث الهاتف، الجامعة، والسنة الدراسية.")}
          </p>
        </button>
      </div>
    </div>
  );
}
