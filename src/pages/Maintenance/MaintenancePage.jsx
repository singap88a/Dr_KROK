import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FiRefreshCw,
  FiZap,
  FiBookOpen,
  FiShield,
  FiChevronDown,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { toast } from "react-toastify";

export default function MaintenancePage({ maintenanceData, onRefresh }) {
  const { t, i18n } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = (i18n.language || "en").toLowerCase().split("-")[0] === "ua" ? "ua" : "en";

  // Only English and Ukrainian as requested
  const languages = [
    { code: "en", name: "English", short: "EN", flag: "https://flagcdn.com/w20/gb.png" },
    { code: "ua", name: "Українська", short: "UA", flag: "https://flagcdn.com/w20/ua.png" },
  ];

  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (code) => {
    setLangDropdownOpen(false);
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    localStorage.setItem("DR_KROK_i18nextLng", code);
    if (typeof onRefresh === "function") {
      setIsRefreshing(true);
      try {
        await onRefresh(code);
      } finally {
        setIsRefreshing(false);
        setLastChecked(new Date());
      }
    }
  };

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (typeof onRefresh === "function") {
        const result = await onRefresh(currentLanguage);
        setLastChecked(new Date());
        const stillInMaintenance = Boolean(
          result?.is_maintenance === true ||
          result?.is_maintenance === 1 ||
          result?.is_maintenance === "1" ||
          result?.is_maintenance === "true"
        );
        if (stillInMaintenance) {
          toast.info(t("maintenance.still_under_maintenance", "The platform is still under scheduled maintenance."));
        } else {
          toast.success(t("maintenance.back_online", "Maintenance complete! Loading platform..."));
        }
      }
    } catch {
      toast.info(t("maintenance.still_under_maintenance", "Checking status... Platform is under maintenance."));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Title and message from backend API or localized default
  const backendTitle = maintenanceData?.title;
  const backendMessage = maintenanceData?.message || maintenanceData?.description;

  const displayTitle =
    backendTitle ||
    t(
      "maintenance.default_title",
      currentLanguage === "ua"
        ? "Платформа Dr. KROK на плановому технічному обслуговуванні"
        : "Platform Under Scheduled Maintenance"
    );

  const displayMessage =
    backendMessage ||
    t(
      "maintenance.default_message",
      currentLanguage === "ua"
        ? "Наразі ми впроваджуємо планові оновлення, оптимізуємо швидкість роботи серверів та розширюємо навчальні бази для кращого досвіду підготовки до іспитів. Робота платформи відновиться найближчим часом."
        : "The platform is currently undergoing scheduled updates and maintenance. We will be back shortly with an improved experience."
    );

  return (
    <div className="relative flex flex-col justify-between min-h-screen bg-slate-50/70 text-slate-800 font-sans selection:bg-primary/20 selection:text-primary">
      {/* ── Top Header Bar ── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 mx-auto w-full max-w-6xl border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Dr. KROK"
            className="w-auto h-9 sm:h-11 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Dr. KROK
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider -mt-0.5">
              Medical Academy
            </span>
          </div>
        </div>

        {/* ── Language Dropdown (EN / UA Only) ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            aria-label="Select Language"
            aria-expanded={langDropdownOpen}
          >
            <img
              src={currentLangObj.flag}
              alt={currentLangObj.name}
              className="w-4 h-3 rounded-xs object-cover"
            />
            <span>{currentLangObj.short}</span>
            <FiChevronDown
              className={`text-slate-400 text-sm transition-transform duration-200 ${
                langDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-30 animate-in fade-in duration-150">
              {languages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center justify-between w-full px-3.5 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-slate-100/90 text-primary font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={lang.flag}
                        alt={lang.name}
                        className="w-4 h-3 rounded-xs object-cover"
                      />
                      <span>{lang.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 mx-auto w-full max-w-3xl text-center">
        {/* Animated Warning Icon (Classic, Clean, No Dark Backdrop) */}
        <div className="relative mb-6">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/80 shadow-xs">
            <FiAlertTriangle className="text-4xl sm:text-5xl animate-bounce" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>
            {t("maintenance.badge", currentLanguage === "ua" ? "Планове технічне оновлення" : "Scheduled Maintenance in Progress")}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          {displayTitle}
        </h1>

        {/* Description / Message */}
        <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-8">
          {displayMessage}
        </p>

        {/* ── Feature Upgrade Cards (Clean, Classic, White) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">
          {/* Card 1: Performance */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs text-left">
            <div className="flex items-center gap-2 mb-1.5 text-blue-600">
              <FiZap className="text-base" />
              <h3 className="text-xs font-bold text-slate-900">
                {t("maintenance.feature_speed_title", currentLanguage === "ua" ? "Висока швидкість" : "Enhanced Speed")}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t("maintenance.feature_speed_desc", currentLanguage === "ua" ? "Оптимізація серверів та миттєвий відгук тестів." : "Faster test engines and smooth lesson playback.")}
            </p>
          </div>

          {/* Card 2: Materials */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs text-left">
            <div className="flex items-center gap-2 mb-1.5 text-indigo-600">
              <FiBookOpen className="text-base" />
              <h3 className="text-xs font-bold text-slate-900">
                {t("maintenance.feature_content_title", currentLanguage === "ua" ? "Оновлення баз КРОК" : "Updated Materials")}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t("maintenance.feature_content_desc", currentLanguage === "ua" ? "Додавання найсвіжіших питань та медичних матеріалів." : "Latest revision questions and explanations.")}
            </p>
          </div>

          {/* Card 3: Stability */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs text-left">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
              <FiShield className="text-base" />
              <h3 className="text-xs font-bold text-slate-900">
                {t("maintenance.feature_security_title", currentLanguage === "ua" ? "Стабільність сервісу" : "System Stability")}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t("maintenance.feature_security_desc", currentLanguage === "ua" ? "Підвищена надійність та безпека даних." : "Higher cloud resilience and uninterrupted service.")}
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          {/* Refresh / Check Status Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-60"
          >
            <FiRefreshCw className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
            <span>
              {isRefreshing
                ? t("maintenance.checking", currentLanguage === "ua" ? "Перевірка..." : "Checking Status...")
                : t("maintenance.check_status", currentLanguage === "ua" ? "Перевірити статус зараз" : "Check Status Now")}
            </span>
          </button>

          {/* Telegram Channel Button */}
          <a
            href="https://t.me/dr_krok"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium shadow-xs transition-colors"
          >
            <FaTelegramPlane className="text-sm text-sky-500" />
            <span>
              {t("maintenance.contact_telegram", currentLanguage === "ua" ? "Telegram-канал" : "Telegram Channel")}
            </span>
          </a>
        </div>

        {/* Auto-check Notice */}
        <p className="text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          <FiClock className="text-xs text-slate-400" />
          <span>
            {t("maintenance.auto_refresh_notice", currentLanguage === "ua" ? "Автоматична перевірка кожні 45 секунд" : "Auto-checking status every 45s")}
          </span>
          <span>•</span>
          <span>
            {lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </p>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 border-t border-slate-200/70 bg-white/50 backdrop-blur-xs">
        <p>© {new Date().getFullYear()} Dr. KROK Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
