import React from "react";
import { FaTimes, FaEnvelope } from "react-icons/fa";

export default function ProfileSidebar({
  loading,
  user,
  menuItems,
  activeTab,
  setActiveTab,
  handleLogout,
  setIsMobileMenuOpen,
}) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Close Button for Mobile */}
      <div className="flex justify-end p-4 lg:hidden shrink-0">
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 text-text-secondary hover:text-text"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="px-6 py-6 text-center border-b border-border shrink-0">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full animate-pulse" />
            <div className="w-24 h-4 mx-auto mb-2 bg-gray-300 rounded animate-pulse" />
            <div className="w-32 h-3 mx-auto bg-gray-300 rounded animate-pulse" />
          </div>
        ) : user ? (
          <>
            <div className="relative w-16 h-16 mx-auto mb-3">
              <img
                src={user.imageprofile || user.avatar || "/user.png"}
                alt={user.name}
                className="object-cover w-full h-full rounded-full shadow-md bg-primary"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  if (!e.currentTarget.src.includes("/user.png")) {
                    e.currentTarget.src = "/user.png";
                  }
                }}
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <h3 className="text-base font-bold text-text truncate px-2">{user.name}</h3>
            <p className="text-xs text-text-secondary truncate px-2">{user.email}</p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full" />
            <div className="w-24 h-4 mx-auto mb-2 bg-gray-300 rounded" />
            <div className="w-32 h-3 mx-auto bg-gray-300 rounded" />
          </div>
        )}
      </div>

      {/* Navigation Menu with custom primary scrollbar */}
      <nav className="p-4 flex-1 overflow-y-auto overscroll-contain space-y-1.5 scrollbar-thin scrollbar-thumb-primary/40 hover:scrollbar-thumb-primary/70 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/40 hover:[&::-webkit-scrollbar-thumb]:bg-primary/70 [&::-webkit-scrollbar-thumb]:rounded-full">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (item.id === "logout") {
                      handleLogout();
                      return;
                    }
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-md font-semibold"
                      : "hover:bg-surface text-text-secondary hover:text-text font-medium"
                  }`}
                >
                  <Icon className="text-base shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge > 0 && (
                    <div className="ml-auto relative flex items-center justify-center shrink-0">
                      {item.id === "orders" ? (
                        <>
                          <FaEnvelope
                            className={`text-base ${
                              activeTab === item.id ? "text-white/90" : "text-primary/80"
                            }`}
                          />
                          <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[8px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-sm border border-surface">
                            {item.badge}
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
