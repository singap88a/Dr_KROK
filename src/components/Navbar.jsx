import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes, FaGlobe, FaUser } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";
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

  const { isLoggedIn, userData, logout } = useUser();

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
        <div className="relative group">
          {settingsLoading ? (
            <div className="w-10 h-10 bg-gray-300 rounded animate-pulse sm:h-12 sm:w-12"></div>
          ) : (
            <img
              src={logoUrl}
              alt="Dr KROK Logo"
              className="h-10 cursor-pointer sm:h-12"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/logo.png";
              }}
            />
          )}
          <span className="absolute w-16 px-2 py-1 mt-2 text-xs text-white transition -translate-x-1/2 rounded-md opacity-0 left-1/2 group-hover:opacity-100 bg-primary">
            Dr KROK
          </span>
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

        <div className="relative flex items-center space-x-4">
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

              <div className="absolute right-0 invisible w-48 mt-2 overflow-hidden transition-all duration-300 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible bg-background border-border">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text">
                    {userData ? userData.name : "User"}
                  </p>
                  <p className="text-xs text-textSecondary">
                    {userData ? userData.email : ""}
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm transition hover:bg-surface text-text"
                >
                  {t("navbar.profile")}
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-sm text-left transition hover:bg-surface text-text"
                >
                  {t("navbar.logout")}
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/register"
              className="px-4 py-2 text-white transition rounded-lg bg-primary hover:bg-primary-dark"
            >
              {t("navbar.signUp")}
            </Link>
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
