import React from 'react';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 border rounded-lg shadow-xl bg-background border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('logoutModal.title')}</h3>
          <button
            onClick={onClose}
            className="transition-colors text-text-secondary hover:text-text"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        <div className="flex items-center mb-6">
          <FaSignOutAlt className="mr-3 text-2xl text-red-500" />
          <p className="text-text-secondary">{t('logoutModal.message')}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 transition-colors border rounded-lg text-text-secondary border-border hover:bg-surface"
          >
            {t('logoutModal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            {t('logoutModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
