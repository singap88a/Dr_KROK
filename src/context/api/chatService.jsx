export function createChatService(request) {
  // Gemini Chat API
  const getChatStatus = async (signal = null) => {
    return await request("chat/status", { auth: true, signal });
  };

  const sendChatMessage = async (message, signal = null) => {
    return await request("chat/send", {
      method: "POST",
      body: { message },
      auth: true,
      signal,
    });
  };

  return {
    getChatStatus,
    sendChatMessage,
  };
}
