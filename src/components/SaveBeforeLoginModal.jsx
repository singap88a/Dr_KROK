import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBookmark, FaTimes, FaSignInAlt } from 'react-icons/fa';

export default function SaveBeforeLoginModal({ isOpen, onClose, onSave, onContinueToLogin }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-xl p-8 overflow-hidden text-center bg-white shadow-2xl dark:bg-gray-800 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute p-2 text-gray-400 transition-colors top-4 right-4 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full dark:bg-blue-900/30">
          <FaBookmark className="text-4xl text-blue-600 dark:text-blue-400" />
        </div>

        {/* Content */}
        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {t('cart.save_before_login_title', 'Save to Wishlist')}
        </h3>
        
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          {t('cart.save_before_login_message', 'Before logging in, we recommend saving this item to your wishlist so you can easily return to it later.')}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onSave}
            className="flex items-center justify-center w-full gap-2 px-6 py-3 font-semibold text-white transition-all rounded-xl border border-transparent bg-primary hover:bg-primary/90 hover:shadow-lg focus:ring-4 focus:ring-primary/20 whitespace-nowrap"
          >
            <FaBookmark className="shrink-0" />
            {t('cart.save_and_login', 'Save & Continue to Login')}
          </button>
          
          <button
            onClick={onContinueToLogin}
            className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-primary transition-colors bg-white border border-primary rounded-xl hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-gray-700 whitespace-nowrap"
          >
            <FaSignInAlt className="shrink-0" />
            {t('cart.continue_without_saving', 'Continue without saving')}
          </button>
        </div>
      </div>
    </div>
  );
}
