import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes, FaGlobe } from "react-icons/fa";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved ? saved : "en";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const languages = [
    { code: "en", name: "EN", flag: "https://flagcdn.com/w20/gb.png" },
    { code: "ua", name: "UA", flag: "https://flagcdn.com/w20/ua.png" },
  ];

  const currentLang = languages.find((l) => l.code === language);

  return (
    <nav className="fixed z-50 w-full border-b shadow-md bg-background border-border">
      <div className="container flex items-center justify-between py-4 mx-auto max-w-7xl">
        {/* Logo */}
        <div className="text-2xl font-bold text-primary">Dr KROK</div>

        {/* Links (desktop) */}
        <ul className="hidden space-x-8 font-medium md:flex text-textSecondary">
          <li>
            <Link to="/" className="transition hover:text-primary">
              Home
            </Link>
          </li>
          <li>
            <a href="/courses" className="transition hover:text-primary">
              Courses
            </a>
          </li>
          <li>
            <a href="/books" className="transition hover:text-primary">
              Books
            </a>
          </li>
          <li>
            <Link to="/about" className="transition hover:text-primary">
              About Us
            </Link>
          </li>
          <li>
            <a href="/contact" className="transition hover:text-primary">
              Contact
            </a>
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

          {/* Sign Up Button */}
          <Link
            to="/auth"
            className="px-4 py-2 text-white transition rounded-lg bg-primary hover:bg-primary-dark"
          >
            Sign Up
          </Link>

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
            Home
          </Link>
          <a
            href="#"
            className="block transition text-textSecondary hover:text-primary"
          >
            Courses
          </a>
          <a
            href="#"
            className="block transition text-textSecondary hover:text-primary"
          >
            Books
          </a>
          <a
            href="#"
            className="block transition text-textSecondary hover:text-primary"
          >
            Exams
          </a>
          <a
            href="#"
            className="block transition text-textSecondary hover:text-primary"
          >
            News
          </a>
          <Link
            to="/about"
            className="block transition text-textSecondary hover:text-primary"
          >
            About Us
          </Link>
          <a
            href="#"
            className="block transition text-textSecondary hover:text-primary"
          >
            Contact
          </a>
          <Link
            to="/auth"
            className="block px-4 py-2 text-center text-white transition rounded-lg bg-primary hover:bg-primary-dark"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
