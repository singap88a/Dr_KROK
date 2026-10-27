import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MaterialImageModal({ selectedImage, onClose }) {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-surface rounded-3xl overflow-hidden border border-border/40 shadow-2xl p-2 cursor-default flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 hover:scale-105 transition-all cursor-pointer z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img
              src={selectedImage}
              alt="Material Zoomed"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-md"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
