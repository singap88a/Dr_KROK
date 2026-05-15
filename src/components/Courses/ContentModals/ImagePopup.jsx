import React from "react";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";

const ImagePopup = ({ show, image, onClose }) => {
  const { t } = useTranslation();

  if (!show || !image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <img
        src={image}
        alt="Selected lesson"
        className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl object-contain bg-white dark:bg-black"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute text-3xl font-bold text-white top-4 right-4"
        aria-label="Close image popup"
      >
        &times;
      </button>
    </div>
  );
};

export default ImagePopup;