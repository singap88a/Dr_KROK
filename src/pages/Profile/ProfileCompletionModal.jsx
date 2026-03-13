import React from "react";
import { useTranslation } from "react-i18next";
import { 
  FaExclamationTriangle,
  FaEdit 
} from "react-icons/fa";

export default function ProfileCompletionModal({ isOpen, onEdit }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden bg-surface rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <FaExclamationTriangle className="text-4xl animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('profile.completion.title')}</h2>
          <p className="text-sm opacity-90 leading-relaxed">
            {t('profile.completion.subtitle')}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 text-center space-y-6">
          <p className="text-text-secondary">
            {t('profile.completion.description') || "Your profile is missing some essential information. Please update it to enjoy all the features of our platform."}
          </p>
          
          <button
            onClick={onEdit}
            className="w-full py-4 flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <FaEdit className="text-lg" />
            <span>{t('profile.completion.submit')}</span>
          </button>
        </div>
        
        {/* Footer info */}
        <div className="px-6 pb-6 text-center border-t border-border pt-4 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">
            {t('profile.completion.required')}
          </p>
        </div>
      </div>
    </div>
  );
}
