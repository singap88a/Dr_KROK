import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaCopy, FaStop, FaTrash, FaRedo, FaPaperPlane, FaTooth, FaTeeth, FaNotesMedical } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";

const GeminiSingap = () => {
  const typingIntervalsRef = useRef({});
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const { darkMode } = useTheme();

  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chats, setChats] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Static user profile
  const profileImage = "user.png";
  const API_URL = 'https://admin.dr-krok.com/api/chat/send';

  // Suggestions
  const suggestions = [
    {
      text: "What are the stages of dental caries development?",
      icon: <FaTooth className="text-xl" />,
    },
    {
      text: "Explain the anatomy of the periodontium.",
      icon: <FaTeeth className="text-xl" />,
    },
    {
      text: "What are the indications for root canal treatment?",
      icon: <FaNotesMedical className="text-xl" />,
    },
  ];

  // Stop typing and any ongoing requests
  const stopGenerating = useCallback(() => {
    setIsTypingStopped(true);
    
    // Abort the API request if it's ongoing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear any typing intervals
    Object.values(typingIntervalsRef.current).forEach((interval) =>
      clearInterval(interval)
    );
    typingIntervalsRef.current = {};
    setIsGenerating(false);
  }, []);

  // Delete chats
  const deleteChats = useCallback(() => {
    stopGenerating();
    setChats([]);
    setShowHeader(true);
    setIsTypingStopped(false);
  }, [stopGenerating]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    deleteChats();
    setShowDeleteConfirm(false);
  }, [deleteChats]);

  // Reset chat
  const resetChat = useCallback(() => {
    deleteChats();
    setInputValue("");
  }, [deleteChats]);

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

  // Send message to Backend API
  const sendToGemini = async (message) => {
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const response = await axios({
        method: 'post',
        url: API_URL,
        data: { message: message },
        signal: signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' 
        }
      });

      // Extract response from backend format
      const botResponse = response.data.message;
      return botResponse;
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Request was aborted');
        return null; // Return null if aborted
      }
      console.error('Error:', error);
      return `Sorry, there was a connection error: ${error.message}`;
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Handle send message
  const handleSendMessage = useCallback(
    async (e) => {
      if (e) e.preventDefault();
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
        setChats((prev) => [...prev, { role: "ai", content: "", loading: true }]);
        
        // Send to Gemini API and get response
        sendToGemini(userMessage).then(aiResponse => {
          if (aiResponse !== null) {
            simulateTypingEffect(aiResponse);
          } else {
            // If aborted, we might want to remove the loading message or show it was stopped
            setChats((prev) => {
              const updated = [...prev];
              const lastIndex = updated.findLastIndex((msg) => msg.role === "ai");
              if (lastIndex !== -1) {
                updated[lastIndex] = { ...updated[lastIndex], loading: false, content: "Interrupted." };
              }
              return updated;
            });
            setIsGenerating(false);
          }
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
      }, 15); // Faster typing
    },
    [isTypingStopped]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback((text) => {
    setInputValue(text);
  }, []);

  // Format message text to support bold (**text**)
  const formatMessage = (text) => {
    if (!text) return null;

    // Replace bullet points (* ) with dots (• )
    const formattedText = text.replace(/(^|\n)\*\s+/g, '$1• ');
    
    // Split text by ** to find bold sections
    const parts = formattedText.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** and wrap in strong tag
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Scroll bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chats]);

  return (
    <div className={`relative flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'bg-background text-text' : 'bg-slate-50 text-gray-900'}`}>
      
      {/* Copy Success Popup */}
      {showCopyPopup && (
        <div className={`fixed z-50 px-4 py-2 text-white bg-green-600 rounded-full shadow-lg top-6 left-1/2 -translate-x-1/2 animate-bounce-in`}>
          Copied to clipboard!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`p-8 rounded-2xl shadow-2xl ${darkMode ? 'bg-surface border-border' : 'bg-white border-gray-100'} border max-w-sm w-full animate-scale-in`}>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FaTrash className="text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-center text-text">Clear History?</h3>
            <p className="mb-8 text-center text-text-muted">This will permanently delete all messages in this conversation.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${darkMode ? 'bg-accent hover:bg-opacity-80' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {showHeader && (
        <header className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-4 mx-auto text-center animate-fade-in">
          <div className="p-4 mb-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <img src="logo.png" alt="Gemini" className="w-20 h-20 drop-shadow-2xl" />
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Hello, there
            </span>
          </h1>
          <p className={`text-2xl md:text-3xl font-medium ${darkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
            How can I help you today?
          </p>

          {/* Suggestions */}
          <div className="grid w-full grid-cols-1 gap-4 mt-16 md:grid-cols-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className={`flex flex-col items-start p-6 text-left transition-all duration-300 hover:scale-[1.02] border rounded-2xl ${
                  darkMode 
                    ? 'bg-surface/50 border-border hover:bg-accent/50' 
                    : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'
                }`}
              >
                <div className={`p-3 rounded-xl mb-4 ${darkMode ? 'bg-background' : 'bg-blue-50 text-blue-600'}`}>
                  {suggestion.icon}
                </div>
                <h4 className="text-sm font-medium leading-relaxed">
                  {suggestion.text}
                </h4>
              </button>
            ))}
          </div>
        </header>
      )}

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto px-4 py-8 mx-auto max-w-4xl w-full scroll-smooth ${
          showHeader ? "hidden" : "block"
        }`}
      >
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`mb-8 flex gap-4 ${chat.role === "user" ? "flex-row-reverse" : "flex-row"} animate-slide-up`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-sm ${chat.loading ? "animate-pulse" : ""}`}>
              <img
                src={chat.role === "ai" ? "logo.png" : profileImage}
                alt={chat.role}
                className="object-cover w-full h-full"
              />
            </div>

            <div className={`group relative max-w-[80%] ${chat.role === "user" ? "items-end" : "items-start"}`}>
              {chat.loading ? (
                <div className={`p-5 rounded-2xl ${darkMode ? 'bg-surface' : 'bg-white shadow-sm'} border ${darkMode ? 'border-border' : 'border-gray-100'}`}>
                  <div className="flex flex-col w-48 gap-3 md:w-80">
                    <div className="w-full h-2 rounded bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20 animate-loading-bar"></div>
                    <div className="w-3/4 h-2 rounded opacity-75 bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20 animate-loading-bar"></div>
                    <div className="w-1/2 h-2 rounded opacity-50 bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20 animate-loading-bar"></div>
                  </div>
                </div>
              ) : (
                <div className={`relative p-5 rounded-2xl shadow-sm text-[15px] leading-relaxed transition-all ${
                  chat.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : `${darkMode ? 'bg-surface border-border' : 'bg-white border-gray-100'} border text-text rounded-tl-none`
                }`}>
                  <p className="whitespace-pre-wrap">{formatMessage(chat.content)}</p>
                  
                  {chat.role === "ai" && !chat.error && (
                    <button
                      onClick={() => copyMessage(chat.content)}
                      className={`absolute -bottom-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-accent/50 ${darkMode ? 'text-text-muted' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Copy message"
                    >
                      <FaCopy className="text-sm" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className={`sticky bottom-0 w-full px-4 pb-6 pt-4 backdrop-blur-md transition-colors ${darkMode ? 'bg-background/80' : 'bg-slate-50/80'}`}>
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative group">
            <div className={`flex items-end gap-2 p-2 pl-4 rounded-[28px] border transition-all duration-300 ${
              darkMode 
                ? 'bg-surface border-border focus-within:border-blue-500/50' 
                : 'bg-white border-gray-200 shadow-lg shadow-gray-200/50 focus-within:border-blue-400 focus-within:shadow-blue-500/10'
            }`}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything..."
                className="flex-1 max-h-40 min-h-[48px] py-3 bg-transparent outline-none resize-none text-[15px] scrollbar-hide"
                rows={1}
              />
              
              <div className="flex gap-1.5 mb-1 mr-1">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={stopGenerating}
                    className="flex items-center justify-center w-10 h-10 text-red-500 transition-all rounded-full hover:bg-red-50"
                    title="Stop generation"
                  >
                    <FaStop className="text-sm" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      inputValue.trim() 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-100" 
                        : "bg-gray-100 text-gray-400 scale-90"
                    }`}
                  >
                    <FaPaperPlane className="text-sm ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={resetChat}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${darkMode ? 'text-text-muted hover:bg-accent' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <FaRedo size={10} /> Reset
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${darkMode ? 'text-text-muted hover:bg-red-500/10 hover:text-red-500' : 'text-gray-500 hover:bg-red-50 hover:text-red-500'}`}
            >
              <FaTrash size={10} /> Clear Chat
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          50% { opacity: 1; transform: translate(-50%, 5px); }
          100% { transform: translate(-50%, 0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loading-bar {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-loading-bar { 
          background-size: 200% 100%;
          animation: loading-bar 1.5s infinite linear;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default GeminiSingap;
