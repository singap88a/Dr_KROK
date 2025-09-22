import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useApi } from "../context/ApiContext";
import { useTranslation } from "react-i18next";

export default function WhatsAppIcon() {
  const { request } = useApi();
  const { t } = useTranslation();
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const response = await request("contact");
        if (response.data && response.data.length > 0) {
          setContactInfo(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch contact info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [request]);

  const openWhatsApp = () => {
    if (contactInfo?.whatsapp) {
      const phoneNumber = contactInfo.whatsapp.replace(/\D/g, ''); // Remove non-digits
      const message = encodeURIComponent("Hello! I need support from Dr. KROK platform.");
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (loading || !contactInfo?.whatsapp) {
    return null;
  }

  return (
    <div className="fixed z-50 cursor-pointer bottom-6 right-6 group">
      <div
        onClick={openWhatsApp}
        className="p-3 transition-all bg-green-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110"
        title={t("common.support", "Support")}
      >
        <FaWhatsapp className="w-8 h-8 text-white" />
      </div>

      {/* Tooltip */}
      <div className="absolute right-0 px-3 py-1 mb-2 text-sm text-white transition-opacity duration-200 bg-gray-800 rounded-lg opacity-0 bottom-full group-hover:opacity-100 whitespace-nowrap">
        {t("common.support", "Support")}
        <div className="absolute w-0 h-0 border-t-4 border-l-4 border-r-4 top-full right-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}
