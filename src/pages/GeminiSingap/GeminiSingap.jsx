/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useRef, useCallback } from "react";
// import iconlogo from "../../../public/iconlogo.svg";

const GeminiSingap = () => {
  const typingIntervalsRef = useRef({});
  const chatContainerRef = useRef(null);

  // Dark / Light Mode
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("themeColor");
    return savedTheme ? savedTheme === "dark_mode" : true;
  });

  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chats, setChats] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [isTypingStopped, setIsTypingStopped] = useState(false);

  // Static user profile
  const profileImage =
    "https://randomuser.me/api/portraits/men/45.jpg"; // static user image
  const staticUser = "static_user@example.com";

  // Suggestions
  const suggestions = [
    {
      text: "What are the best tips to improve my public speaking skills?",
      icon: "lightbulb",
    },
    {
      text: "Can you help me find the latest news on web development?",
      icon: "explore",
    },
    {
      text: "Write JavaScript code to sum all elements in an array.",
      icon: "code",
    },
  ];

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("themeColor", newMode ? "dark_mode" : "light_mode");
  }, [darkMode]);

  // Delete chats
  const deleteChats = useCallback(() => {
    if (window.confirm("Are you sure you want to delete all chats?")) {
      setChats([]);
      setShowHeader(true);
      Object.values(typingIntervalsRef.current).forEach((interval) =>
        clearInterval(interval)
      );
      typingIntervalsRef.current = {};
    }
  }, []);

  // Stop typing
  const stopTyping = useCallback(() => {
    setIsTypingStopped(true);
    Object.values(typingIntervalsRef.current).forEach((interval) =>
      clearInterval(interval)
    );
    typingIntervalsRef.current = {};
    setIsGenerating(false);
  }, []);

  // Copy message
  const copyMessage = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!inputValue.trim() || isGenerating) return;

      const userMessage = inputValue.trim();
      setInputValue("");
      setIsTypingStopped(false);

      const newChats = [...chats, { role: "user", content: userMessage }];
      setChats(newChats);
      setShowHeader(false);
      setIsGenerating(true);

      // Add AI placeholder
      setTimeout(() => {
        const updatedChats = [...newChats, { role: "ai", content: "", loading: true }];
        setChats(updatedChats);
        simulateTypingEffect("This is a static AI response for demo purposes.");
      }, 300);
    },
    [inputValue, isGenerating, chats]
  );

  // Simulate typing
  const simulateTypingEffect = useCallback(
    (text) => {
      let index = 0;
      const intervalId = Symbol();

      setChats((prevChats) => {
        const updated = [...prevChats];
        const lastIndex = updated.findLastIndex((msg) => msg.role === "ai");
        if (lastIndex !== -1) updated[lastIndex] = { ...updated[lastIndex], loading: false };
        return updated;
      });

      typingIntervalsRef.current[intervalId] = setInterval(() => {
        if (isTypingStopped) {
          clearInterval(typingIntervalsRef.current[intervalId]);
          delete typingIntervalsRef.current[intervalId];
          setIsGenerating(false);
          return;
        }

        setChats((prevChats) => {
          if (index >= text.length) {
            clearInterval(typingIntervalsRef.current[intervalId]);
            delete typingIntervalsRef.current[intervalId];
            setIsGenerating(false);
            return prevChats;
          }

          const updated = [...prevChats];
          const lastIndex = updated.findLastIndex((msg) => msg.role === "ai");
          if (lastIndex !== -1) {
            updated[lastIndex] = { ...updated[lastIndex], content: text.substring(0, index + 1) };
            index++;
          }
          return updated;
        });
      }, 30);
    },
    [isTypingStopped]
  );

  // Scroll bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      {showHeader && (
        <header
          className={`mx-auto max-w-4xl w-full px-4 pt-12 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          <h1 className="text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
            Hello, there
          </h1>
          <p className={`text-4xl mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            How can I help you today?
          </p>

          {/* Suggestions */}
          <ul className="flex gap-5 pb-4 mt-16 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => setInputValue(suggestion.text)}
                className={`p-5 w-56 flex-shrink-0 flex flex-col items-end rounded-xl cursor-pointer transition-colors ${
                  darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <h4 className={`w-full text-left ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  {suggestion.text}
                </h4>
                <span
                  className={`material-symbols-rounded mt-6 text-xl ${
                    darkMode ? "text-gray-100 bg-gray-900" : "text-gray-900 bg-white"
                  } rounded-full w-10 h-10 flex items-center justify-center`}
                >
                  {suggestion.icon}
                </span>
              </li>
            ))}
          </ul>
        </header>
      )}

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto px-4 py-8 mx-auto max-w-4xl w-full ${
          darkMode ? "scrollbar-color-gray-700" : "scrollbar-color-gray-300"
        }`}
      >
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`mb-6 ${chat.role === "user" ? "ml-auto max-w-3xl" : "mr-auto max-w-3xl"} ${
              chat.role === "ai" && index === chats.length - 1 && isGenerating ? "opacity-80" : ""
            }`}
          >
            <div className="flex items-start gap-6">
              {chat.role === "ai" ? (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9c/Google_Gemini_logo.svg"
                  alt="Gemini avatar"
                  className={`w-10 h-10 object-cover rounded-full ${chat.loading ? "animate-spin" : ""}`}
                />
              ) : (
                <img
                  src={profileImage}
                  alt="User avatar"
                  className="object-cover w-10 h-10 rounded-full"
                />
              )}

              {chat.loading ? (
                <div className="flex-1">
                  <div className="flex flex-col w-full gap-3">
                    <div className="h-3 w-full rounded bg-gradient-to-r from-blue-500 via-gray-700 to-blue-500 animate-pulse bg-[length:800px_100px]"></div>
                    <div className="h-3 w-3/4 rounded bg-gradient-to-r from-blue-500 via-gray-700 to-blue-500 animate-pulse bg-[length:800px_100px]"></div>
                    <div className="h-3 w-1/2 rounded bg-gradient-to-r from-blue-500 via-gray-700 to-blue-500 animate-pulse bg-[length:800px_100px]"></div>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <p
                    className={`whitespace-pre-wrap ${darkMode ? "text-gray-100" : "text-gray-900"} ${
                      chat.error ? "text-red-400" : ""
                    }`}
                  >
                    {chat.content}
                  </p>
                </div>
              )}

              {chat.role === "ai" && !chat.loading && !chat.error && (
                <button
                  onClick={() => copyMessage(chat.content)}
                  className={`material-symbols-rounded rounded-full w-9 h-9 flex items-center justify-center text-primary ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                >
                  content_copy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className={`sticky bottom-0 w-full px-4 py-4 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <form onSubmit={handleSendMessage} className="flex max-w-4xl gap-3 mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a prompt here"
              className={`w-full h-14 rounded-full px-6 pr-16 outline-none ${
                darkMode
                  ? "bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-700"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-200"
              }`}
              required
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isGenerating}
              className={`material-symbols-rounded absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full ${
                inputValue.trim() ? "text-blue-500" : darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              send
            </button>
          </div>

          <div className="flex gap-2">
            {isGenerating && (
              <button
                type="button"
                onClick={stopTyping}
                className={`material-symbols-rounded h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-red-500"
                    : "bg-gray-100 hover:bg-gray-200 text-red-600"
                }`}
                title="Stop generating"
              >
                stop
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className={`material-symbols-rounded h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              {darkMode ? "light_mode" : "dark_mode"}
            </button>
            <button
              type="button"
              onClick={deleteChats}
              className={`material-symbols-rounded h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeminiSingap;
