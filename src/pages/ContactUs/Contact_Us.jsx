import React, { useState, useEffect } from "react";
import {
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState(null);

  // ✅ جلب بيانات الكونتاكت من API
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch("https://dr-krok.hudurly.com/api/contact");
        const json = await res.json();
        if (json.success) {
          setContactData(json.data[0]); // أول عنصر من الكونتاكت
        }
      } catch (error) {
        console.error("Error fetching contact:", error);
      }
    };
    fetchContact();
  }, []);

  // ✅ تحديث الفورم
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ إرسال الرسالة للـ API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://dr-krok.hudurly.com/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("✅ Your message has been sent successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          city: "",
          message: "",
        });
      } else {
        toast.error("❌ Failed to send message!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("⚠️ Something went wrong!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div
        className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${
            contactData?.image ||
            "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white sm:p-6">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
            {contactData?.title_page || "Contact Us"}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
            Have questions or need support? Reach out to our team and we’ll get
            back to you as quickly as possible.
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="min-h-screen px-4 py-16 bg-background text-text md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8">
              {contactData && (
                <>
                  <div className="flex items-center gap-4">
                    <FiPhone className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Phone / WhatsApp</h4>
                      <p className="text-text-secondary">
                        {contactData.phone || contactData.whatsapp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FiMail className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p className="text-text-secondary">{contactData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FiMapPin className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Address</h4>
                      <p className="text-text-secondary">
                        {contactData.address}
                      </p>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="w-full overflow-hidden shadow rounded-2xl">
                    <iframe
                      src={contactData.map}
                      width="100%"
                      height="250"
                      allowFullScreen=""
                      loading="lazy"
                      className="border-0"
                    ></iframe>
                  </div>

                  {/* Socials */}
                  <div className="flex flex-wrap gap-4 mt-6">
                    {contactData.facebook && (
                      <a
                        href={contactData.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white"
                      >
                        <FaFacebookF />
                      </a>
                    )}
                    {contactData.x && (
                      <a
                        href={contactData.x}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white"
                      >
                        <FaTwitter />
                      </a>
                    )}
                    {contactData.iniesta && (
                      <a
                        href={contactData.iniesta}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white"
                      >
                        <FaInstagram />
                      </a>
                    )}
                    {contactData.tiktok && (
                      <a
                        href={contactData.tiktok}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white"
                      >
                        <FaTiktok />
                      </a>
                    )}
                    {contactData.youtube && (
                      <a
                        href={contactData.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white"
                      >
                        <FaYoutube />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 border shadow rounded-2xl bg-surface border-border"
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <textarea
                name="message"
                rows="5"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-medium text-white transition rounded-xl bg-primary hover:shadow-lg disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
