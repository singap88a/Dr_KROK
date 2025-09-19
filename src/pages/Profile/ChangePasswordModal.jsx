import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { request } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !newPasswordConfirmation) {
      toast.error(t('profile.password.toast.fields_required'));
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      toast.error(t('profile.password.toast.mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('profile.password.toast.too_short'));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("old_password", oldPassword);
      formData.append("new_password", newPassword);
      formData.append("new_password_confirmation", newPasswordConfirmation);

      const data = await request('/profile/change-password', {
        method: "POST",
        auth: true,
        isFormData: true,
        body: formData,
      });

      if (data.success) {
        toast.success(data.message || t('profile.password.toast.success'));
        setOldPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");
        onClose();
      } else {
        toast.error(data.message || t('profile.password.toast.fail'));
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.message || t('profile.password.toast.fail'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md border shadow-2xl bg-surface border-border rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <FaLock className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text">
              {t('profile.password.title')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaTimes className="text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Old Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-text-secondary">
              {t('profile.password.old_password')}
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 transition-all border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={t('profile.password.old_password_placeholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-text-secondary hover:text-text"
              >
                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-text-secondary">
              {t('profile.password.new_password')}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 transition-all border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={t('profile.password.new_password_placeholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-text-secondary hover:text-text"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-text-secondary">
              {t('profile.password.confirm_password')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={newPasswordConfirmation}
                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                className="w-full px-4 py-3 pr-12 transition-all border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={t('profile.password.confirm_password_placeholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-text-secondary hover:text-text"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-text-muted">
            <p className="mb-1">{t('profile.password.requirements.title')}</p>
            <ul className="ml-4 space-y-1">
              <li className={`flex items-center gap-2 ${newPassword.length >= 6 ? 'text-green-600' : 'text-text-muted'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-600' : 'bg-text-muted'}`}></div>
                {t('profile.password.requirements.length')}
              </li>
              <li className={`flex items-center gap-2 ${newPassword && newPasswordConfirmation && newPassword === newPasswordConfirmation ? 'text-green-600' : 'text-text-muted'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword && newPasswordConfirmation && newPassword === newPasswordConfirmation ? 'bg-green-600' : 'bg-text-muted'}`}></div>
                {t('profile.password.requirements.match')}
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 transition-colors border text-text-secondary border-border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              {t('profile.password.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-white transition-colors bg-primary rounded-xl hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  {t('profile.password.changing')}
                </>
              ) : (
                <>
                  <FaLock className="text-sm" />
                  {t('profile.password.change')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
