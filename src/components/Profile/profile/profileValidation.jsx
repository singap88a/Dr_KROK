import React from "react";
import { FaExclamationCircle } from "react-icons/fa";

// Helper function to format date for display as YYYY-MM-DD
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "Not provided";

  // Handle different date formats from API
  const dateParts = dateString.split("-");
  if (dateParts.length === 3) {
    // If date is in format "dd-MM-yyyy" or "MM-dd-yyyy"
    if (dateParts[0].length === 2 && dateParts[1].length === 2) {
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
    // If date is in format "yyyy-MM-dd"
    return dateString;
  }

  // Fallback: try to parse as Date object
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return dateString;
};

// Helper function to format date for input field
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  const dateParts = dateString.split("-");
  if (dateParts.length === 3) {
    if (dateParts[0].length === 2 && dateParts[1].length === 2) {
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
    return dateString;
  }

  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return "";
};

// Helper to format social URLs
export const formatSocialUrl = (url, domain) => {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("@")) cleanUrl = cleanUrl.substring(1);

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  if (cleanUrl.includes(domain)) {
    return `https://${cleanUrl}`;
  }

  return `https://${domain}/${cleanUrl}`;
};

// Helper to translate backend errors
export const translateBackendError = (errorMsg, t) => {
  if (typeof errorMsg !== "string") return t("profile.toast.update_fail", "Update failed");
  const lowerMsg = errorMsg.toLowerCase();

  if (lowerMsg.includes("instagram")) return t("profile.toast.invalid_instagram", "Invalid Instagram link format.");
  if (lowerMsg.includes("facebook")) return t("profile.toast.invalid_facebook", "Invalid Facebook link format.");
  if (lowerMsg.includes("telegram")) return t("profile.toast.invalid_telegram", "Invalid Telegram link format.");
  if (lowerMsg.includes("whatsapp")) return t("profile.toast.invalid_whatsapp", "Invalid WhatsApp link format.");

  if (lowerMsg.includes("البريد") || lowerMsg.includes("email") || lowerMsg.includes("إيميل")) {
    return t("profile.toast.email_exists", "This email is already registered to another account.");
  }

  if (lowerMsg.includes("الهاتف") || lowerMsg.includes("phone") || lowerMsg.includes("رقم")) {
    return t("profile.toast.phone_exists", "This phone number is already registered.");
  }

  if (lowerMsg.includes("المستخدم") || lowerMsg.includes("username")) {
    return t("profile.toast.username_exists", "This username is already taken.");
  }

  const arabicPattern = /[\u0600-\u06FF]/;
  if (arabicPattern.test(errorMsg)) {
    return t("profile.toast.update_fail", "An error occurred while saving. Please check your data.");
  }

  return errorMsg;
};

// ===================== Validation helpers =====================

export const FIELD_ORDER = [
  "name", "email", "phone", "birth", "gender", "university_id", "college_year",
  "specialization_id", "facebook", "instagram", "telegram", "whatsapp",
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_CHARS_REGEX = /^\+?[0-9\s\-()]+$/;

export const isValidSocial = (value, domains, usernameRegex) => {
  if (!value) return true;
  const v = value.trim();
  if (!v) return true;
  if (/\s/.test(v)) return false;
  const lower = v.toLowerCase();
  if (domains.some(d => lower.includes(d))) {
    try {
      const url = new URL(lower.startsWith("http") ? lower : `https://${lower}`);
      const host = url.hostname.replace(/^(www\.|m\.)/, "");
      return domains.includes(host) && url.pathname.replace(/\//g, "").length > 0;
    } catch {
      return false;
    }
  }
  if (lower.startsWith("http") || lower.startsWith("www.")) return false;
  return usernameRegex ? usernameRegex.test(v) : false;
};

export const validateField = (field, value, t) => {
  const v = typeof value === "string" ? value.trim() : value;

  switch (field) {
    case "name":
      if (!v) return t("profile.validation.name_required");
      if (v.length < 3) return t("profile.validation.name_short");
      if (v.length > 100) return t("profile.validation.name_long");
      if (!/^[\p{L}\s'.-]+$/u.test(v)) return t("profile.validation.name_invalid");
      return "";

    case "email":
      if (!v) return t("profile.validation.email_required");
      if (!EMAIL_REGEX.test(v)) return t("profile.validation.email_invalid");
      return "";

    case "phone": {
      if (!v) return t("profile.validation.phone_required");
      if (!PHONE_CHARS_REGEX.test(v)) return t("profile.validation.phone_chars");
      const digits = v.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 15) return t("profile.validation.phone_length", { count: digits.length });
      return "";
    }

    case "birth": {
      if (!v) return t("profile.validation.birth_required");
      const d = new Date(v);
      if (isNaN(d.getTime())) return t("profile.validation.birth_invalid");
      const today = new Date();
      if (d > today) return t("profile.validation.birth_future");
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      if (age < 14) return t("profile.validation.birth_too_young");
      if (age > 100) return t("profile.validation.birth_too_old");
      return "";
    }

    case "gender":
      return v ? "" : t("profile.validation.gender_required");

    case "university_id":
      return v ? "" : t("profile.validation.university_required");

    case "college_year":
      return v ? "" : t("profile.validation.college_year_required");

    case "facebook":
      return isValidSocial(v, ["facebook.com", "fb.com"], /^@?[A-Za-z0-9.]{3,50}$/)
        ? "" : t("profile.validation.facebook_invalid");

    case "instagram":
      return isValidSocial(v, ["instagram.com"], /^@?[A-Za-z0-9._]{1,30}$/)
        ? "" : t("profile.validation.instagram_invalid");

    case "telegram":
      return isValidSocial(v, ["t.me", "telegram.me"], /^@?[A-Za-z0-9_]{5,32}$/)
        ? "" : t("profile.validation.telegram_invalid");

    case "whatsapp": {
      if (!v) return "";
      if (PHONE_CHARS_REGEX.test(v)) {
        const digits = v.replace(/\D/g, "");
        return digits.length >= 9 && digits.length <= 15 ? "" : t("profile.validation.whatsapp_invalid");
      }
      return isValidSocial(v, ["wa.me", "whatsapp.com", "api.whatsapp.com"], null)
        ? "" : t("profile.validation.whatsapp_invalid");
    }

    default:
      return "";
  }
};

export const validateProfileForm = (data, t) => {
  const errs = {};
  FIELD_ORDER.forEach(field => {
    const msg = validateField(field, data[field], t);
    if (msg) errs[field] = msg;
  });
  return errs;
};

export const BACKEND_FIELD_ALIASES = {
  university: "university_id",
  specialization: "specialization_id",
  birth_date: "birth",
  date_of_birth: "birth",
};

export const DUPLICATE_PATTERN = /(taken|already|exist|in use|مسجل|موجود|مستخدم|вже|зайнят)/i;

export const detectFieldFromMessage = (message) => {
  const lower = (message || "").toLowerCase();
  if (lower.includes("instagram")) return "instagram";
  if (lower.includes("facebook")) return "facebook";
  if (lower.includes("telegram")) return "telegram";
  if (lower.includes("whatsapp")) return "whatsapp";
  if (lower.includes("email") || lower.includes("البريد") || lower.includes("إيميل")) return "email";
  if (lower.includes("phone") || lower.includes("الهاتف") || lower.includes("رقم")) return "phone";
  if (lower.includes("birth") || lower.includes("ميلاد")) return "birth";
  if (lower.includes("gender") || lower.includes("الجنس") || lower.includes("النوع")) return "gender";
  if (lower.includes("university") || lower.includes("الجامعة")) return "university_id";
  if (lower.includes("college") || lower.includes("السنة") || lower.includes("الفرقة")) return "college_year";
  if (lower.includes("name") || lower.includes("الاسم")) return "name";
  return null;
};

export const mapBackendFieldMessage = (field, msg, t) => {
  const text = Array.isArray(msg) ? msg[0] : msg;
  const fallback = t(`profile.validation.${field}_invalid`, { defaultValue: t("profile.validation.generic_invalid") });
  if (typeof text !== "string" || !text) return fallback;
  if (DUPLICATE_PATTERN.test(text)) {
    if (field === "email") return t("profile.toast.email_exists", "This email is already registered to another account.");
    if (field === "phone") return t("profile.toast.phone_exists", "This phone number is already registered.");
  }
  if (/[\u0600-\u06FF]/.test(text)) return fallback;
  return text;
};

export const extractBackendFieldErrors = (payload, message, t) => {
  const result = {};
  const errs = payload?.errors || payload?.data?.errors;
  if (errs && typeof errs === "object" && !Array.isArray(errs)) {
    Object.entries(errs).forEach(([key, msg]) => {
      const field = BACKEND_FIELD_ALIASES[key] || key;
      if (FIELD_ORDER.includes(field)) result[field] = mapBackendFieldMessage(field, msg, t);
    });
  }
  if (Object.keys(result).length === 0) {
    const text = payload?.message || message;
    const field = detectFieldFromMessage(text);
    if (field) result[field] = mapBackendFieldMessage(field, text, t);
  }
  return result;
};

// Inline error message displayed under an invalid input
export const FieldError = ({ id, message }) => {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 animate-fadeIn">
      <FaExclamationCircle className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
};
