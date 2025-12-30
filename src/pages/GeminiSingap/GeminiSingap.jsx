import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaCopy, FaStop, FaTrash, FaRedo, FaPaperPlane, FaLightbulb, FaSearch, FaCode, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const GeminiSingap = () => {
  const typingIntervalsRef = useRef({});
  const chatContainerRef = useRef(null);
  const { darkMode, toggleTheme } = useTheme();

  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chats, setChats] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Static user profile
  const profileImage = "https://randomuser.me/api/portraits/men/45.jpg";
  const API_KEY = "AIzaSyAnSFh2GFZN4UutuPIOwSgCsYVVm8rikXE";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // Suggestions
  const suggestions = [
    {
      text: "What are the best tips to improve my public speaking skills?",
      icon: <FaLightbulb className="text-xl" />,
    },
    {
      text: "Can you help me find the latest news on web development?",
      icon: <FaSearch className="text-xl" />,
    },
    {
      text: "Write JavaScript code to sum all elements in an array.",
      icon: <FaCode className="text-xl" />,
    },
  ];

  // Delete chats
  const deleteChats = useCallback(() => {
    setChats([]);
    setShowHeader(true);
    Object.values(typingIntervalsRef.current).forEach((interval) =>
      clearInterval(interval)
    );
    typingIntervalsRef.current = {};
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    deleteChats();
    setShowDeleteConfirm(false);
  }, [deleteChats]);

  // Reset chat
  const resetChat = useCallback(() => {
    setChats([]);
    setShowHeader(true);
    setInputValue("");
    Object.values(typingIntervalsRef.current).forEach((interval) =>
      clearInterval(interval)
    );
    typingIntervalsRef.current = {};
    setIsGenerating(false);
    setIsTypingStopped(false);
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

  // Copy message with popup
  const copyMessage = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyPopup(true);
      setTimeout(() => setShowCopyPopup(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // Send message to Gemini API
  const sendToGemini = async (message) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Response error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response received from Gemini');
      }
    } catch (error) {
      console.error('Error:', error);
      return `Sorry, there was a connection error: ${error.message}`;
    }
  };

  // Handle send message
  const handleSendMessage = useCallback(
    async (e) => {
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
        
        // Send to Gemini API and get response
        sendToGemini(userMessage).then(aiResponse => {
          simulateTypingEffect(aiResponse);
        });
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

  // Handle suggestion click
  const handleSuggestionClick = useCallback((text) => {
    setInputValue(text);
  }, []);

  // Scroll bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // Add custom CSS for scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .snap-x {
        scroll-snap-type: x mandatory;
      }
      .snap-mandatory {
        scroll-snap-stop: always;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={`relative flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'bg-background text-text' : 'bg-white text-gray-900'}`}>
  

      {/* Copy Success Popup */}
      {showCopyPopup && (
        <div className={`fixed z-50 px-4 py-2 text-white bg-green-500 rounded-lg shadow-lg top-4 right-16 animate-fade-in-out`}>
          Text copied successfully!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-lg bg-surface border border-border max-w-sm w-full mx-4`}>
            <h3 className="mb-4 text-lg font-semibold text-text">Confirm Delete</h3>
            <p className="mb-6 text-text-secondary">Are you sure you want to delete all chats? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 transition-colors text-text-secondary hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {showHeader && (
        <header className={`w-full max-w-4xl px-4 pt-12 mx-auto ${darkMode ? 'text-text' : 'text-gray-900'}`}>
          <h1 className="text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
            Hello, there
          </h1>
          <p className={`mt-2 text-4xl ${darkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
            How can I help you today?
          </p>

          {/* Suggestions */}
          <ul className="flex gap-5 pb-4 mt-16 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className={`flex flex-col items-end flex-shrink-0 w-56 p-5 transition-colors cursor-pointer rounded-xl ${darkMode ? 'bg-surface hover:bg-accent text-text' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                <h4 className="w-full text-left">
                  {suggestion.text}
                </h4>
                <span className={`flex items-center justify-center w-10 h-10 mt-6 text-xl rounded-full ${darkMode ? 'text-text bg-background' : 'text-gray-900 bg-white'}`}>
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
          showHeader ? "mt-0" : "mt-8"
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
                  src="logo.png"
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
                    className={`whitespace-pre-wrap ${chat.error ? "text-red-400" : darkMode ? "text-text" : "text-gray-900"}`}
                  >
                    {chat.content}
                  </p>
                </div>
              )}

              {chat.role === "ai" && !chat.loading && !chat.error && (
                <button
                  onClick={() => copyMessage(chat.content)}
                  className={`flex items-center justify-center transition-colors rounded-full w-9 h-9 ${darkMode ? 'text-text hover:bg-accent' : 'text-gray-900 hover:bg-gray-200'}`}
                  title="Copy message"
                >
                  <FaCopy className="text-lg" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className={`sticky bottom-0 w-full px-4 py-4 border-t transition-colors ${darkMode ? 'bg-background border-border' : 'bg-white border-gray-200'}`}>
        <form onSubmit={handleSendMessage} className="flex max-w-4xl gap-3 mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              className={`w-full px-6 pr-16 rounded-full outline-none h-14 transition-colors ${darkMode ? 'text-text placeholder-text-secondary bg-surface focus:bg-accent' : 'text-gray-900 placeholder-gray-500 bg-gray-100 focus:bg-gray-200'}`}
              required
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isGenerating}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                inputValue.trim() && !isGenerating
                  ? "text-blue-500 hover:text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <FaPaperPlane className="text-lg" />
            </button>
          </div>

          <div className="flex gap-2">
            {isGenerating && (
              <button
                type="button"
                onClick={stopTyping}
                className={`flex items-center justify-center flex-shrink-0 text-red-600 transition-colors rounded-full h-14 w-14 ${darkMode ? 'bg-surface hover:bg-accent' : 'bg-gray-100 hover:bg-gray-200'}`}
                title="Stop generating"
              >
                <FaStop className="text-lg" />
              </button>
            )}
            <button
              type="button"
              onClick={resetChat}
              className={`flex items-center justify-center flex-shrink-0 transition-colors rounded-full h-14 w-14 ${darkMode ? 'text-text bg-surface hover:bg-accent' : 'text-gray-900 bg-gray-100 hover:bg-gray-200'}`}
              title="Reset chat"
            >
              <FaRedo className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className={`flex items-center justify-center flex-shrink-0 transition-colors rounded-full h-14 w-14 ${darkMode ? 'text-text bg-surface hover:bg-accent' : 'text-gray-900 bg-gray-100 hover:bg-gray-200'}`}
              title="Delete all chats"
            >
              <FaTrash className="text-lg" />
            </button>
          </div>
        </form>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GeminiSingap;