// ContentModals/ImagePopup.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";

export const ImagePopup = ({ showImagePopup, setShowImagePopup, selectedImage }) => {
  if (!showImagePopup || !selectedImage) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={() => setShowImagePopup(false)}
    >
      <img
        src={selectedImage}
        alt="Selected lesson"
        className="max-w-full max-h-full rounded-lg shadow-lg"
        style={{ width: "600px", height: "400px", objectFit: "contain" }}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={() => setShowImagePopup(false)}
        className="absolute text-3xl font-bold text-white top-4 right-4"
        aria-label="Close image popup"
      >
        &times;
      </button>
    </div>
  );
};