import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes, FaGlobe, FaUser, FaSignOutAlt, FaShoppingCart, FaTrash, FaBookmark } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { getSettings } = useApi();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const [language, setLanguage] = useState(() => {
    const saved =
      localStorage.getItem("i18nextLng") || localStorage.getItem("language");
    return saved ? saved.toLowerCase().split("-")[0] : "en";
  });

  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);

  const { isLoggedIn, userData, logout } = useUser();
  const { cartItems, removeFromCart } = useCart();
  const [reminderStep, setReminderStep] = useState('hidden'); // 'visible' | 'hidden'
  const [isHoveringReminder, setIsHoveringReminder] = useState(false);

  // Cart Reminder Logic: 5s ON / 10s OFF with Hover Pause
  useEffect(() => {
    if (cartItems?.length === 0 || cartOpen) {
      setReminderStep('hidden');
      return;
    }

    let timeout;
    if (reminderStep === 'visible') {
      // If visible and NOT hovering, hide after 5 seconds
      if (!isHoveringReminder) {
        timeout = setTimeout(() => setReminderStep('hidden'), 5000);
      }
    } else {
      // If hidden, show after 10 seconds
      timeout = setTimeout(() => setReminderStep('visible'), 10000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [reminderStep, isHoveringReminder, cartItems?.length, cartOpen]);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language, i18n]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await getSettings();
        if (response && response.data && response.data.image_logo_web) {
          setLogoUrl(response.data.image_logo_web);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, [getSettings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
    };

    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cartOpen]);

  const languages = [
    { code: "en", name: "EN", flag: "https://flagcdn.com/w20/gb.png" },
    { code: "ua", name: "UA", flag: "https://flagcdn.com/w20/ua.png" },
  ];

  const currentLang =
    languages.find((l) => l.code === language) || languages[0];

  const navItems = [
    { path: "/", label: "navbar.home" },
    { path: "/courses", label: "navbar.courses" },
    { path: "/articles", label: "navbar.blogs" },
    { path: "/books", label: "navbar.books" },
    { path: "/about", label: "navbar.about" },
    { path: "/contact", label: "navbar.contact" },
  ];

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  return (
    <nav className="fixed z-50 w-full border-b shadow-md bg-background border-border">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto md:px-0 max-w-7xl">
        <div className="relative flex-shrink-0 group">
          {settingsLoading ? (
            <div className="w-10 h-10 bg-gray-300 rounded animate-pulse sm:h-12 sm:w-12"></div>
          ) : (
            <Link to="/">
                        <img
              src={logoUrl}
              alt="Dr KROK Logo"
              className="h-10 cursor-pointer sm:h-12"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/logo.png";
              }}
            />
            </Link>

          )}
        </div>

        <ul className="hidden space-x-8 font-medium md:flex text-textSecondary">
          {navItems.map((item) => (
            <li key={item.path} className="group">
              <Link
                to={item.path}
                className={`relative transition hover:text-primary ${
                  location.pathname === item.path
                    ? "font-bold text-primary"
                    : ""
                }`}
              >
                {t(item.label)}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    location.pathname === item.path
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative flex items-center space-x-2 md:space-x-4">
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center px-3 py-2 text-sm border rounded-lg border-border hover:bg-surface"
            >
              <img
                src={currentLang?.flag || "https://flagcdn.com/w20/gb.png"}
                alt={currentLang?.name || "EN"}
                className="w-5 h-5 mr-2 rounded-sm"
              />
              {currentLang?.name || "EN"}
              <FaGlobe className="ml-2" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 w-40 mt-2 overflow-hidden border rounded-lg shadow-lg bg-background border-border">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm transition hover:bg-surface"
                  >
                    <img
                      src={lang.flag}
                      alt={lang.name}
                      className="w-5 h-5 mr-2 rounded-sm"
                    />
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <div className="relative group">
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 text-white transition rounded-full bg-primary hover:bg-primary-dark"
              >
                <img
                  src={
                    (userData &&
                      (userData.imageprofile || userData.avatar)) ||
                    "/user.png"
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    if (!e.currentTarget.src.includes('/user.png')) {
                      e.currentTarget.src = "/user.png";
                    }
                  }}
                />
              </Link>

              <div className="absolute right-0 invisible min-w-48 max-w-xs mt-2 overflow-hidden transition-all duration-300 border rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 group-hover:visible bg-background border-border backdrop-blur-sm">
                <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                  <p className="text-sm font-semibold text-text truncate">
                    {userData ? userData.name : "User"}
                  </p>
                  <p className="text-xs text-textSecondary truncate">
                    {userData ? userData.email : ""}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-surface text-text group/item"
                  >
                    <FaUser className="text-primary group-hover/item:scale-110 transition-transform" />
                    <span>{t("navbar.profile")}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 group/item"
                  >
                    <FaSignOutAlt className="group-hover/item:scale-110 transition-transform" />
                    <span>{t("navbar.logout")}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/register"
              state={{ from: location.pathname }}
              className="px-4 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base text-white transition rounded-lg bg-primary hover:bg-primary-dark whitespace-nowrap"
            >
              {t("navbar.signUp")}
            </Link>
          )}

          {/* Cart Icon (Only show if not empty) */}
          {cartItems.length > 0 && (
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => {
                  setCartOpen(!cartOpen);
                  setReminderStep('hidden');
                }}
                className={`relative p-2 transition rounded-full text-textSecondary hover:bg-surface hover:text-primary ${reminderStep === 'visible' ? 'animate-bounce' : ''}`}
              >
                <FaBookmark className="text-xl" />
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                  {cartItems.length}
                </span>
              </button>

              {/* Cart Reminder Tooltip - Rectangular primary design with arrow */}
              {reminderStep === 'visible' && !cartOpen && (
                <div 
                  className="absolute right-0 top-full mt-3 z-[60] origin-top-right"
                  onMouseEnter={() => setIsHoveringReminder(true)}
                  onMouseLeave={() => setIsHoveringReminder(false)}
                >
                  <div className="relative px-4 py-3 bg-primary text-white rounded-lg shadow-2xl animate-in fade-in zoom-in slide-in-from-top-3 duration-300 border border-white/20 min-w-[220px]">
                    {/* Arrow pointing from icon to the box */}
                    <div className="absolute -top-1.5 right-4 w-4 h-4 bg-primary border-t border-l border-white/20 rotate-45"></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FaBookmark className="text-white/90 text-xs" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 border-b border-white/30 leading-tight">Wishlist Reminder</span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed drop-shadow-sm">
                        {t('cart.reminder_short', ' Your items are waiting! Check your wishlist to complete your order✨.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Dropdown */}
              {cartOpen && (
                <div className="absolute right-0 w-80 mt-3 overflow-hidden border rounded-xl shadow-2xl bg-background border-border z-50 backdrop-blur-md">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                    <h3 className="font-semibold text-text">{t("cart.title", "Your Cart")}</h3>
                    <span className="text-sm font-medium text-primary">{cartItems.length} {t("cart.items", "Items")}</span>
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="px-4 py-8 text-center text-textSecondary">
                      <FaShoppingCart className="mx-auto mb-2 text-3xl opacity-20" />
                      <p>{t("cart.empty", "Your cart is empty")}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {cartItems.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-4 transition hover:bg-surface/50 group">
                          <Link 
                            to={item.url}
                            state={item.stateData}
                            onClick={() => setCartOpen(false)}
                            className="flex-shrink-0"
                          >
                            <img src={item.image || "/logo.png"} alt={item.name} className="object-cover w-16 h-16 border rounded-lg border-border" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={item.url}
                              state={item.stateData}
                              onClick={() => setCartOpen(false)}
                              className="block text-sm font-medium truncate text-text hover:text-primary transition-colors"
                              title={item.name}
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-textSecondary capitalize">{t(`cart.type_${item.type}`, item.type.replace('_', ' '))}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-bold text-primary">₴{Number(item.price).toFixed(2)}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(item.id, item.type);
                            }}
                            className="p-2 text-gray-400 transition-colors rounded-full hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            title={t("cart.remove", "Remove")}
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          <button
            onClick={toggleTheme}
            className="text-xl transition text-textSecondary hover:text-primary"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            className="text-2xl transition md:hidden text-textSecondary hover:text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden top-20"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="relative z-50 px-4 py-4 space-y-4 border-t md:hidden bg-background border-border">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="block font-bold transition text-textSecondary hover:text-primary"
              >
                {t(item.label)}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-center text-white transition rounded-lg bg-primary hover:bg-primary-dark"
                >
                  {t("navbar.profile")}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-center text-white transition bg-red-600 rounded-lg hover:bg-red-700"
                >
                  {t("navbar.logout")}
                </button>
              </>
            ) : (
              <Link
                to="/register"
                state={{ from: location.pathname }}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-center text-white transition rounded-lg bg-primary hover:bg-primary-dark"
              >
                {t("navbar.signUp")}
              </Link>
            )}
          </div>
        </>
      )}

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          window.location.href = "/";
        }}
      />
    </nav>
  );
}
