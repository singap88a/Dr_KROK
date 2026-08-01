import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationCircle, FaTimes, FaMobileAlt, FaLaptop } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function DeviceErrorModal({ isOpen, onClose, errorMessage }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isMobileError = errorMessage?.toLowerCase().includes('mobile');
  const isLaptopError = errorMessage?.toLowerCase().includes('laptop');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-3xl dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Border */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute p-2 text-gray-400 transition-colors rounded-full top-4 right-4 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <FaTimes size={20} />
          </button>

          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-red-50 dark:bg-red-900/20">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-red-100/50 dark:bg-red-900/10"
                ></motion.div>
                {isMobileError ? (
                  <FaMobileAlt className="text-4xl text-red-500" />
                ) : isLaptopError ? (
                  <FaLaptop className="text-4xl text-red-500" />
                ) : (
                  <FaExclamationCircle className="text-4xl text-red-500" />
                )}
                
                {/* Small exclamation badge */}
                <div className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-900 rounded-full shadow-lg">
                  <FaExclamationCircle className="text-xl text-orange-500" />
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-3 text-2xl font-black text-gray-900 dark:text-white">
                {t('auth.deviceLimit.title', 'Device Limit Reached')}
              </h3>

              {/* Message */}
              <div className="p-4 mb-6 text-sm leading-relaxed text-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 dark:text-red-200">
                {errorMessage || t('auth.deviceLimit.defaultMessage', 'This account is already registered on another device. You cannot log in from a new one without deleting the old device.')}
              </div>
              
              <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
                {t('auth.deviceLimit.instruction', 'To access your account from this device, please contact support to remove your previous device from the system.')}
              </p>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3 sm:flex-row">
                <button
                  onClick={() => navigate('/contact')}
                  className="flex-1 px-6 py-3 font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  {t('auth.deviceLimit.contactSupport', 'Contact Support')}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 font-bold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('common.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
