import React from "react";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";

const PDFPopup = ({ show, file, onClose }) => {
  const { t } = useTranslation();

  if (!show || !file) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl p-6 mx-4 rounded-lg dark:bg-gray-800 h-4/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={t("common.close", "Close")}
          >
            <FaTimes className="text-xl text-teal-50" />
          </button>
        </div>
        <div className="h-full border rounded-lg">
          <iframe
            src={`${file}#toolbar=0`}
            className="w-full h-full rounded-lg"
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFPopup;