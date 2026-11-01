// src/utils/device.js
import { getDeviceId } from "./deviceId";
import { getDeviceType, getDeviceName, isInAppBrowser } from "./deviceInfo";

export const getDeviceInfo = async () => {
  const device_id = await getDeviceId();
  const device_type = getDeviceType();
  const device_name = getDeviceName();

  return {
    device_id,
    device_type,
    device_name,
  };
};

export { getDeviceId, getDeviceType, getDeviceName, isInAppBrowser };
