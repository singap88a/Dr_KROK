import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaCamera,
  FaChevronDown,
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa";
import { FieldError } from "./profileValidation";

export default function ProfileAvatarCard({
  user,
  localUser,
  isEditing,
  imagePreview,
  handleImageChange,
  formData,
  handleInputChange,
  handleBlur,
  errors,
  fieldClass,
  errorId,
  a11yProps,
}) {
  const { t } = useTranslation();

  return (
    <div className="p-6 text-center border bg-surface border-border rounded-xl h-fit lg:sticky lg:top-24">
      {/* Profile Picture */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <img
          src={imagePreview || "/user.png"}
          alt={localUser.name}
          className="object-cover w-full h-full rounded-full shadow-lg bg-primary"
          onError={(e) => {
            e.currentTarget.onerror = null;
            if (!e.currentTarget.src.includes("/user.png")) {
              e.currentTarget.src = "/user.png";
            }
          }}
        />
        {isEditing && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="absolute bottom-0 right-0 p-2 text-white transition-colors rounded-full cursor-pointer bg-primary hover:bg-secondary"
            >
              <FaCamera className="text-sm" />
            </label>
          </>
        )}
      </div>

      <h3 className="text-lg font-semibold">{localUser.name}</h3>
      <p className="text-text-secondary">{localUser.email}</p>
      {formData.image && (
        <p className="mt-2 text-sm text-green-600">New image selected</p>
      )}

      {/* Social Media Section */}
      <div className="mt-8 pt-8 border-t border-border">
        <h4 className="mb-4 text-sm font-bold text-left uppercase tracking-wider opacity-60 flex items-center gap-2">
          <FaChevronDown className="text-[10px]" /> {t("profile.social_media")}
        </h4>
        <div className="space-y-3">
          {/* Facebook */}
          <div>
            {isEditing ? (
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                  <FaFacebook className="inline mr-1 text-blue-600" /> Facebook{" "}
                  <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="https://facebook.com/..."
                  {...a11yProps("facebook")}
                  className={fieldClass(
                    "facebook",
                    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1"
                  )}
                />
                <FieldError id={errorId("facebook")} message={errors.facebook} />
              </div>
            ) : (
              <a
                href={user.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  user.facebook
                    ? "border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50"
                    : "border-dashed border-border opacity-50 cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                    <FaFacebook className="text-blue-600 text-xs" />
                  </div>
                  <span className="text-xs font-medium">Facebook</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  {user.facebook ? "View" : "None"}
                </span>
              </a>
            )}
          </div>

          {/* Instagram */}
          <div>
            {isEditing ? (
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                  <FaInstagram className="inline mr-1 text-pink-600" /> Instagram{" "}
                  <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="https://instagram.com/..."
                  {...a11yProps("instagram")}
                  className={fieldClass(
                    "instagram",
                    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1"
                  )}
                />
                <FieldError id={errorId("instagram")} message={errors.instagram} />
              </div>
            ) : (
              <a
                href={user.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  user.instagram
                    ? "border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50"
                    : "border-dashed border-border opacity-50 cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-pink-100 dark:bg-pink-900/30">
                    <FaInstagram className="text-pink-600 text-xs" />
                  </div>
                  <span className="text-xs font-medium">Instagram</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  {user.instagram ? "View" : "None"}
                </span>
              </a>
            )}
          </div>

          {/* Telegram */}
          <div>
            {isEditing ? (
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                  <FaTelegram className="inline mr-1 text-blue-500" /> Telegram{" "}
                  <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="https://t.me/..."
                  {...a11yProps("telegram")}
                  className={fieldClass(
                    "telegram",
                    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1"
                  )}
                />
                <FieldError id={errorId("telegram")} message={errors.telegram} />
              </div>
            ) : (
              <a
                href={user.telegram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  user.telegram
                    ? "border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50"
                    : "border-dashed border-border opacity-50 cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/20">
                    <FaTelegram className="text-blue-500 text-xs" />
                  </div>
                  <span className="text-xs font-medium">Telegram</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  {user.telegram ? "View" : "None"}
                </span>
              </a>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            {isEditing ? (
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                  <FaWhatsapp className="inline mr-1 text-green-600" /> WhatsApp{" "}
                  <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Wa.me/..."
                  {...a11yProps("whatsapp")}
                  className={fieldClass(
                    "whatsapp",
                    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1"
                  )}
                />
                <FieldError id={errorId("whatsapp")} message={errors.whatsapp} />
              </div>
            ) : (
              <a
                href={
                  user.whatsapp
                    ? user.whatsapp.includes("http")
                      ? user.whatsapp
                      : `https://wa.me/${user.whatsapp}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  user.whatsapp
                    ? "border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50"
                    : "border-dashed border-border opacity-50 cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                    <FaWhatsapp className="text-green-600 text-xs" />
                  </div>
                  <span className="text-xs font-medium">WhatsApp</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  {user.whatsapp ? "Chat" : "None"}
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
