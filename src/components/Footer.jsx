import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="py-12 mt-12 bg-surface text-text">
      <div className="container grid grid-cols-1 gap-10 mx-auto max-w-7xl md:grid-cols-4">
        
        {/* Logo & Description */}
        <div>
          <h1 className="mb-4 text-2xl font-bold text-text">Dr KROK</h1>
          <p className="text-sm leading-6 text-text-muted">
            Dr KROK is a professional e-learning platform specialized in
            providing high-quality medical courses with top doctors and experts
            to help you advance in the healthcare field.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text">Quick Links</h2>
          <ul className="space-y-2 text-text-muted">
            <li><a href="#" className="transition hover:text-primary">Home</a></li>
            <li><a href="#" className="transition hover:text-primary">Courses</a></li>
            <li><a href="#" className="transition hover:text-primary">About Us</a></li>
            <li><a href="#" className="transition hover:text-primary">Contact</a></li>
          </ul>
        </div>

        {/* Courses Categories */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text">Categories</h2>
          <ul className="space-y-2 text-text-muted">
            <li><a href="#" className="transition hover:text-primary">Dentistry</a></li>
            <li><a href="#" className="transition hover:text-primary">Pharmacy</a></li>
            <li><a href="#" className="transition hover:text-primary">Nursing</a></li>
            <li><a href="#" className="transition hover:text-primary">Surgery</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="#" className="text-2xl transition hover:text-primary"><FaFacebook /></a>
            <a href="#" className="text-2xl transition hover:text-primary"><FaTwitter /></a>
            <a href="#" className="text-2xl transition hover:text-primary"><FaLinkedin /></a>
            <a href="#" className="text-2xl transition hover:text-primary"><FaYoutube /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-6 mt-10 text-sm text-center border-t border-border text-text-muted">
        © {new Date().getFullYear()} Dr KROK. All rights reserved.
      </div>
    </footer>
  );
}
