export const getDeviceInfo = () => {
  // 1. Get or generate device_id
  let deviceId = localStorage.getItem("DR_KROK_device_id");
  if (!deviceId) {
    // Generate a random UUID-like string
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("DR_KROK_device_id", deviceId);
  }

  // 2. Determine device_type
  const ua = navigator.userAgent;
  let deviceType = "laptop"; // default to laptop/desktop
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = "mobile";
  }

  // 3. Determine device_name (Browser + OS)
  let browserName = "Unknown Browser";
  if (ua.indexOf("Firefox") > -1) {
    browserName = "Firefox";
  } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
    browserName = "Opera";
  } else if (ua.indexOf("Trident") > -1) {
    browserName = "Internet Explorer";
  } else if (ua.indexOf("Edge") > -1) {
    browserName = "Edge";
  } else if (ua.indexOf("Chrome") > -1) {
    browserName = "Chrome";
  } else if (ua.indexOf("Safari") > -1) {
    browserName = "Safari";
  }

  let osName = "Unknown OS";
  if (ua.indexOf("Win") !== -1) osName = "Windows";
  if (ua.indexOf("Mac") !== -1) osName = "MacOS";
  if (ua.indexOf("X11") !== -1) osName = "UNIX";
  if (ua.indexOf("Linux") !== -1) osName = "Linux";
  if (/Android/.test(ua)) osName = "Android";
  if (/iPhone|iPad|iPod/.test(ua)) osName = "iOS";

  const deviceName = `${browserName} on ${osName}`;

  return {
    device_id: deviceId,
    device_type: deviceType,
    device_name: deviceName,
  };
};
