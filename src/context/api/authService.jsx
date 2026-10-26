export function createAuthService(request) {
  const getSettings = async () => {
    return await request("setting");
  };

  const getMyProfile = async () => {
    return await request("profile/get-my-profile", { auth: true });
  };

  const login = async (email, password, type = null) => {
    const { getDeviceInfo } = await import("../../utils/device");
    const deviceData = getDeviceInfo();
    const body =
      type === "google"
        ? { type: "google", ...deviceData }
        : { email, password, ...deviceData };
    return await request("auth/login", {
      method: "POST",
      body,
    });
  };

  const register = async (
    name,
    email,
    otp,
    password,
    password_confirmation,
    university,
    role = "student"
  ) => {
    const { getDeviceInfo } = await import("../../utils/device");
    const deviceData = getDeviceInfo();
    return await request("auth/register", {
      method: "POST",
      body: {
        name,
        email,
        otp,
        password,
        password_confirmation,
        university,
        role,
        ...deviceData,
      },
    });
  };

  const sendOtp = async (email) => {
    return await request("auth/send-otp", {
      method: "POST",
      body: { email },
    });
  };

  const forgotPassword = async (email) => {
    return await request("auth/password/forget", {
      method: "POST",
      body: { email },
    });
  };

  const resetPassword = async (
    email,
    otp,
    password,
    password_confirmation
  ) => {
    return await request("auth/password/reset", {
      method: "POST",
      body: { email, otp, password, password_confirmation },
    });
  };

  return {
    getSettings,
    getMyProfile,
    login,
    register,
    sendOtp,
    forgotPassword,
    resetPassword,
  };
}
