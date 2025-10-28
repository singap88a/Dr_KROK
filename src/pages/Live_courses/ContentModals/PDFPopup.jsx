// ContentModals/PDFPopup.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const PDFPopup = ({ showFilesPopup, setShowFilesPopup, selectedFile }) => {
  const { t } = useTranslation();

  if (!showFilesPopup || !selectedFile) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={() => setShowFilesPopup(false)}
    >
      <div
        className="w-full max-w-4xl p-6 mx-4 rounded-lg dark:bg-gray-800 h-4/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilesPopup(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={t("common.close", "Close")}
          >
            <FaTimes className="text-xl text-teal-50" />
          </button>
        </div>
        <div className="h-full border rounded-lg">
          <iframe
            src={`${selectedFile}#toolbar=0`}
            className="w-full h-full rounded-lg"
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  );
};