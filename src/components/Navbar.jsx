import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes, FaGlobe, FaUser } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("i18nextLng") || localStorage.getItem("language");
    return saved ? saved.split("-")[0] : "en";
  });
  
  const { isLoggedIn, userData, logout } = useUser();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language, i18n]);

  // Force LTR direction regardless of language
  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
  }, []);

  const languages = [
    { code: "en", name: "EN", flag: "https://flagcdn.com/w20/gb.png" },
    { code: "ua", name: "UA", flag: "https://flagcdn.com/w20/ua.png" },
  ];

  const currentLang = languages.find((l) => l.code === language);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="fixed z-50 w-full border-b shadow-md bg-background border-border">
      <div className="container flex items-center justify-between py-4 mx-auto max-w-7xl">
        {/* Logo */}
        <div className="relative group">
          <img
            src="/logo.png"
            alt="Dr KROK Logo"
            className="h-10 cursor-pointer sm:h-12"
          />
          <span className="absolute w-16 px-2 py-1 mt-2 text-xs text-white transition -translate-x-1/2 rounded-md opacity-0 left-1/2 group-hover:opacity-100 bg-primary">
            Dr KROK
          </span>
        </div>

        {/* Links (desktop) */}
        <ul className="hidden space-x-8 font-medium md:flex text-textSecondary">
          <li>
            <Link to="/" className="transition hover:text-primary">
              {t('navbar.home')}
            </Link>
          </li>
          <li>
            <Link to="/courses" className="transition hover:text-primary">
              {t('navbar.courses')}
            </Link>
          </li>
          <li>
            <Link to="/books" className="transition hover:text-primary">
              {t('navbar.books')}
            </Link>
          </li>
          <li>
            <Link to="/about" className="transition hover:text-primary">
              {t('navbar.about')}
            </Link>
          </li>
          <li>
            <Link to="/contact" className="transition hover:text-primary">
              {t('navbar.contact')}
            </Link>
          </li>
        </ul>

        {/* Icons and Buttons */}
        <div className="relative flex items-center space-x-4">
          {/* Language Toggle */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center px-3 py-2 text-sm border rounded-lg border-border hover:bg-surface"
            >
              <img
                src={currentLang.flag}
                alt={currentLang.name}
                className="w-5 h-5 mr-2 rounded-sm"
              />
              {currentLang.name}
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

          {/* User Profile or Sign Up Button */}
          {isLoggedIn ? (
            <div className="relative group">
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 text-white transition rounded-full bg-primary hover:bg-primary-dark"
              >
                <img 
                  src={(userData && (userData.imageprofile || userData.avatar)) || "/user.png"}
                  alt="Profile"
                  className="w-full h-full rounded-full"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/user.png"; }}
                />
              </Link>
              
              {/* Dropdown Menu */}
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
                  {t('navbar.profile')}
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm transition hover:bg-surface text-text"
                >
                  {t('navbar.settings')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-sm text-left transition hover:bg-surface text-text"
                >
                  {t('navbar.logout')}
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/register"
              className="px-4 py-2 text-white transition rounded-lg bg-primary hover:bg-primary-dark"
            >
              {t('navbar.signUp')}
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl transition text-textSecondary hover:text-primary focus:outline-none"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="text-2xl transition md:hidden text-textSecondary hover:text-primary focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="px-6 py-4 space-y-4 border-t md:hidden bg-background border-border">
          <Link
            to="/"
            className="block transition text-textSecondary hover:text-primary"
          >
            {t('navbar.home')}
          </Link>
          <Link
            to="/courses"
            className="block transition text-textSecondary hover:text-primary"
          >
            {t('navbar.courses')}
          </Link>
          <Link
            to="/books"
            className="block transition text-textSecondary hover:text-primary"
          >
            {t('navbar.books')}
          </Link>
          <Link
            to="/about"
            className="block transition text-textSecondary hover:text-primary"
          >
            {t('navbar.about')}
          </Link>
          <Link
            to="/contact"
            className="block transition text-textSecondary hover:text-primary"
          >
            {t('navbar.contact')}
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="block px-4 py-2 text-center text-white transition rounded-lg bg-primary hover:bg-primary-dark"
              >
                {t('navbar.profile')}
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-center text-white transition bg-red-600 rounded-lg hover:bg-red-700"
              >
                {t('navbar.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/register"
              className="block px-4 py-2 text-center text-white transition rounded-lg bg-primary hover:bg-primary-dark"
            >
              {t('navbar.signUp')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}