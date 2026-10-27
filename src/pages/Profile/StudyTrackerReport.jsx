import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FaFire,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useStudyTracker } from "../../context/StudyTrackerContext";
import TrackerKpiCards from "../../components/Profile/tracker/TrackerKpiCards";
import TrackerCalendarGrid from "../../components/Profile/tracker/TrackerCalendarGrid";
import TrackerDayModal from "../../components/Profile/tracker/TrackerDayModal";

export default function StudyTrackerReport() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar" || i18n.dir?.() === "rtl";
  const { getStudyMonthlyReport } = useApi();
  const { refreshSummary } = useStudyTracker();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDayModal, setSelectedDayModal] = useState(null);

  // Fetch report data for selected month/year
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudyMonthlyReport({ month: selectedMonth, year: selectedYear });
      if (res?.success && res?.data) {
        setReportData(res.data);
      } else {
        setError(res?.message || t("studyTracker.errorLoading", "Failed to load monthly report"));
      }
    } catch (err) {
      console.error("Monthly report fetch error:", err);
      setError(err?.message || t("studyTracker.networkError", "Error connecting to server"));
    } finally {
      setLoading(false);
    }
  }, [getStudyMonthlyReport, selectedMonth, selectedYear, t]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear());
  };

  const monthNames = [
    t("months.jan", "January"),
    t("months.feb", "February"),
    t("months.mar", "March"),
    t("months.apr", "April"),
    t("months.may", "May"),
    t("months.jun", "June"),
    t("months.jul", "July"),
    t("months.aug", "August"),
    t("months.sep", "September"),
    t("months.oct", "October"),
    t("months.nov", "November"),
    t("months.dec", "December"),
  ];

  const currentMonthLabel = `${monthNames[selectedMonth - 1] || reportData?.month_name || selectedMonth} ${selectedYear}`;

  const commitment = reportData?.commitment_percentage ?? 0;
  const totalHours = reportData?.total_study_hours ?? 0;
  const formattedTotal = reportData?.formatted_total_time || `${totalHours}h`;
  const avgDailyHours = reportData?.average_daily_hours ?? 0;
  const bestDay = reportData?.best_study_day;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Header & Month Navigator ─────────────────────────────────────── */}
      <div className="bg-surface/70 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/20">
              <FaFire className="text-amber-500" />
              <span>{t("studyTracker.badge", "Study Analytics & Streak")}</span>
            </div>
            <h2 className="text-2xl font-bold text-text flex items-center gap-3">
              <span>{t("studyTracker.monthlyReportTitle", "Monthly Study Report & Calendar")}</span>
            </h2>
            <p className="text-sm text-textSecondary mt-1">
              {t("studyTracker.monthlyReportDesc", "Track your daily study dedication, active hours, and learning consistency.")}
            </p>
          </div>

          {/* Month Selector Controls */}
          <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl shadow-inner self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              onClick={isRtl ? handleNextMonth : handlePrevMonth}
              className="p-2 hover:bg-surface rounded-lg text-textSecondary hover:text-text transition-colors"
              title={t("common.previous", "Previous")}
              aria-label="Previous Month"
            >
              <FaChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="font-semibold text-text text-sm sm:text-base px-3 min-w-[140px] text-center select-none">
              {currentMonthLabel}
            </span>

            <button
              onClick={isRtl ? handlePrevMonth : handleNextMonth}
              className="p-2 hover:bg-surface rounded-lg text-textSecondary hover:text-text transition-colors"
              title={t("common.next", "Next")}
              aria-label="Next Month"
            >
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                handleCurrentMonth();
                fetchReport();
                refreshSummary();
              }}
              className="p-2 hover:bg-surface rounded-lg text-primary transition-colors ml-1"
              title={t("studyTracker.refresh", "Refresh Report")}
              aria-label="Refresh Report"
            >
              <FaSync className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4 Top KPI Cards ──────────────────────────────────────────────── */}
      <TrackerKpiCards
        commitment={commitment}
        reportData={reportData}
        formattedTotal={formattedTotal}
        totalHours={totalHours}
        avgDailyHours={avgDailyHours}
        bestDay={bestDay}
        t={t}
      />

      {/* ─── Interactive Calendar Grid (1 to 31) ─────────────────────────── */}
      <TrackerCalendarGrid
        loading={loading}
        error={error}
        fetchReport={fetchReport}
        reportData={reportData}
        onSelectDay={(day) => setSelectedDayModal(day)}
        t={t}
      />

      {/* ─── Day Activities Detail Modal ──────────────────────────────────── */}
      <TrackerDayModal
        selectedDayModal={selectedDayModal}
        onClose={() => setSelectedDayModal(null)}
        t={t}
      />
    </div>
  );
}
