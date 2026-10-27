import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaGraduationCap,
  FaShoppingCart,
  FaStar,
  FaCoins,
  FaBook,
  FaChevronRight,
} from "react-icons/fa";

export default function DashboardStatsGrid({ user, summary, setActiveTab }) {
  const { t } = useTranslation();

  const statCards = [
    {
      key: "courses",
      icon: FaGraduationCap,
      color: "blue",
      value: summary?.total_enrolled_courses ?? user?.stats?.courses ?? 0,
      label: t("profile.stats.courses", "Courses"),
      tab: "courses",
      badge: null,
    },
    {
      key: "orders",
      icon: FaShoppingCart,
      color: "emerald",
      value: user?.stats?.orders ?? 0,
      label: t("profile.stats.orders", "Orders"),
      tab: "orders",
      badge: null,
    },
    {
      key: "rating",
      icon: FaStar,
      color: "yellow",
      value: user?.stats?.rating || user?.rating || 0,
      label: t("profile.stats.rating", "Rating"),
      tab: "ratings",
      badge: null,
      suffix: "/ 5",
    },
    {
      key: "points",
      icon: FaCoins,
      color: "amber",
      value: summary?.total_earned_points ?? 0,
      label: t("myCourses.totalPointsEarned", "Points Earned"),
      tab: "courses",
      badge: summary?.overall_points_percentage
        ? `${summary.overall_points_percentage}%`
        : "Points",
    },
    {
      key: "materials",
      icon: FaBook,
      color: "purple",
      value: user?.materials_count || 0,
      label: t("profile.sidebar.myMaterials", "My Material"),
      tab: "materials",
      badge: null,
    },
  ];

  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
    amber: "bg-amber-500/10 text-amber-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  const badgeColorMap = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {statCards.map(({ key, icon: Icon, color, value, label, tab, badge, suffix }) => (
        <div
          key={key}
          onClick={() => setActiveTab(tab)}
          className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-surface border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform ${colorMap[color]}`}>
              <Icon />
            </div>
            {badge ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColorMap[color] || "bg-border text-text-secondary"}`}>
                {badge}
              </span>
            ) : (
              <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
                {t("profile.dashboard.view", "View")}
                <FaChevronRight className="text-[10px]" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1 text-2xl font-black text-text">
              <span>{value}</span>
              {suffix && <span className="text-xs font-normal text-text-secondary">{suffix}</span>}
            </div>
            <div className="text-xs font-medium text-text-secondary mt-1">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
