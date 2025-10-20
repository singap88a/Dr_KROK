import React, { useState, useEffect } from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { useTranslation, Trans } from "react-i18next";
import { useApi } from "../context/ApiContext";
import he from 'he';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { getSettings, request } = useApi();

  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [footerDescription, setFooterDescription] = useState("");
  const [contactData, setContactData] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response && response.data) {
          // Set logo from API
          if (response.data.image_logo_web) {
            setLogoUrl(response.data.image_logo_web);
          }

          // Set footer description from API and decode HTML entities
          if (response.data.description_footer_web) {
            const decodedDescription = he.decode(response.data.description_footer_web);
            setFooterDescription(decodedDescription);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        // Keep default values on error
      }
    };

    const fetchContact = async () => {
      try {
        const json = await request('contact');
        if (json.success) {
          setContactData(json.data[0]);
        }
      } catch (error) {
        console.error("Error fetching contact:", error);
      }
    };

    fetchSettings();
    fetchContact();
  }, [getSettings, request, i18n.language]); // Add i18n.language as dependency to re-fetch when language changes

  return (
    <footer className="px-6 py-12 mt-12 bg-surface text-text">
      <div className="container grid grid-cols-1 gap-10 mx-auto max-w-7xl md:grid-cols-4">

        {/* Logo & Description */}
        <div>
          <div className="relative mb-4 group">
            <img
              src={logoUrl}
              alt="Dr KROK Logo"
              className="h-16 cursor-pointer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/logo.png";
              }}
            />
            <span className="w-16 px-2 py-1 mt-2 text-xs text-white transition -translate-x-1/2 rounded-md opacity-0 left-1/2 group-hover:opacity-100 bg-primary">
              Dr KROK
            </span>
          </div>

          {footerDescription ? (
            <div
              className="text-sm leading-6 text-text-muted"
              dangerouslySetInnerHTML={{ __html: footerDescription }}
            />
          ) : (
            <p className="text-sm leading-6 text-text-muted">
              Dr KROK is a professional e-learning platform specialized in
              providing high-quality medical courses with top doctors and experts
              to help you advance in the healthcare field.
            </p>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text">{t('footer.quickLinks')}</h2>
          <ul className="space-y-2 text-text-muted">
            <li><a href="/" className="transition hover:text-primary">{t('footer.home')}</a></li>
            <li><a href="/courses" className="transition hover:text-primary">{t('footer.courses')}</a></li>
            <li><a href="/about" className="transition hover:text-primary">{t('footer.about')}</a></li>
            <li><a href="/contact" className="transition hover:text-primary">{t('footer.contact')}</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text">{t('footer.resources')}</h2>
          <ul className="space-y-2 text-text-muted">
            <li><a href="/articles" className="transition hover:text-primary">{t('footer.blogs')}</a></li>
            <li><a href="/privacypolicy" className="transition hover:text-primary">{t('footer.privacyPolicy')}</a></li>
            <li><a href="/instructors" className="transition hover:text-primary">{t('footer.instructors')}</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text">{t('footer.followUs')}</h2>
          <div className="flex space-x-4">
            {contactData ? (
              <>
                {contactData.facebook && (
                  <a
                    href={contactData.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xl transition hover:text-primary"
                  >
                    <FaFacebookF />
                  </a>
                )}
                {contactData.x && (
                  <a
                    href={contactData.x}
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xl transition hover:text-primary"
                  >
                    <FaTwitter />
                  </a>
                )}
                {contactData.iniesta && (
                  <a
                    href={contactData.iniesta}
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xl transition hover:text-primary"
                  >
                    <FaInstagram />
                  </a>
                )}
                {contactData.tiktok && (
                  <a
                    href={contactData.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xl transition hover:text-primary"
                  >
                    <FaTiktok />
                  </a>
                )}
                {contactData.youtube && (
                  <a
                    href={contactData.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xl transition hover:text-primary"
                  >
                    <FaYoutube />
                  </a>
                )}
              </>
            ) : (
              // Fallback to default social media links if no API data
              <>
                <a href="#" className="text-2xl transition hover:text-primary"><FaFacebook /></a>
                <a href="#" className="text-2xl transition hover:text-primary"><FaTwitter /></a>
                <a href="#" className="text-2xl transition hover:text-primary"><FaLinkedin /></a>
                <a href="#" className="text-2xl transition hover:text-primary"><FaYoutube /></a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-6 mt-10 text-sm text-center border-t border-border text-text-muted">
        <Trans
          i18nKey="footer.copyright"
          values={{ year: new Date().getFullYear() }}
          components={{
            strong: <strong style={{ color: '#0891b2', fontWeight: '900' }} />
          }}
        />
      </div>
    </footer>
  );
}
