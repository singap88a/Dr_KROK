import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaUserEdit, FaTimes, FaBookmark } from 'react-icons/fa';

export default function IncompleteProfileModal({ isOpen, onClose, showSaveOption, onSave }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full dark:bg-red-900/30">
          <FaUserEdit className="text-4xl text-red-600 dark:text-red-400" />
        </div>

        {/* Content */}
        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {t('profile.incomplete_title', 'Incomplete Profile')}
        </h3>
        
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          {t('profile.incomplete_message', 'Your profile data is missing. Please complete your profile information to proceed with this purchase.')}
        </p>

        {showSaveOption && (
          <div className="p-3 mb-6 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-800 text-left">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 text-center">
              {t('cart.save_before_profile_message', '💡 We recommend saving this product to your wishlist first, so you can easily return to it after updating your profile.')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {showSaveOption ? (
            <button
              onClick={() => {
                if (onSave) onSave();
                onClose();
                navigate('/profile');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-xl border border-transparent bg-primary hover:bg-primary/90 hover:shadow-lg focus:ring-4 focus:ring-primary/20 whitespace-nowrap"
            >
              <FaBookmark className="shrink-0" />
              {t('profile.save_and_update', 'Save & Update Profile')}
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                navigate('/profile');
              }}
              className="flex-1 px-6 py-3 font-semibold text-white transition-all rounded-xl border border-transparent bg-primary hover:bg-primary/90 hover:shadow-lg focus:ring-4 focus:ring-primary/20"
            >
              {t('profile.go_to_profile', 'Update Profile')}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 whitespace-nowrap"
          >
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
