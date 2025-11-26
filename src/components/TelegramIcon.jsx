import React from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function TelegramIcon() {
  const { t } = useTranslation();

  // حط لينك التليجرام هنا
  const telegramUrl = "https://t.me/YOUR_TELEGRAM_USERNAME";

  const openTelegram = () => {
    window.open(telegramUrl, "_blank");
  };

  return (
    <div className="fixed z-50 cursor-pointer bottom-6 right-6 group">
      <div
        onClick={openTelegram}
        className="p-3 transition-all bg-blue-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110"
        title={t("common.support", "Support")}
      >
        <FaTelegramPlane className="w-8 h-8 text-white" />
      </div>

      {/* Tooltip */}
      <div className="absolute right-0 px-3 py-1 mb-2 text-sm text-white transition-opacity duration-200 bg-gray-800 rounded-lg opacity-0 bottom-full group-hover:opacity-100 whitespace-nowrap">
        {t("common.support", "Support")}
        <div className="absolute w-0 h-0 border-t-4 border-l-4 border-r-4 top-full right-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}
