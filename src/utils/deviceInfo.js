// src/utils/deviceInfo.js

/**
 * Determine device type ('mobile' or 'laptop') strictly based on UA/platform features,
 * invariant to screen orientation or browser desktop mode.
 */
export function getDeviceType() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const isIPadOS =
    typeof navigator !== 'undefined' &&
    navigator.platform === 'MacIntel' &&
    navigator.maxTouchPoints > 1;
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  return isMobileUA || isIPadOS ? 'mobile' : 'laptop';
}

/**
 * Determine a descriptive human-readable device name e.g. "Chrome on Windows"
 */
export function getDeviceName() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  let browser = 'Unknown Browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Chrome\/|CriOS/.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let os = 'Unknown OS';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Mac OS X/.test(ua)) os = 'MacOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return `${browser} on ${os}`;
}

/**
 * Detect if the site is being opened inside an in-app browser
 * (e.g., Telegram, Facebook, Instagram, WhatsApp, Snapchat, TikTok)
 * where storage is isolated and risks being cleared.
 */
export function isInAppBrowser() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  return /FBAN|FBAV|Instagram|Telegram|Line|WhatsApp|Snapchat|TikTok/i.test(ua);
}
