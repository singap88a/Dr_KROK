import React, { useState } from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Heroabout from "../../components/About/Heroabout";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 2000);
  };

  return (
    <div className="">
            <Heroabout
  title= "Contact Us"
  description= "Have questions or need support? Reach out to our team and we’ll get back to you as quickly as possible."
  imageUrl= "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg" // صورة مناسبة لصفحة تواصل
      />
          <section className="min-h-screen px-4 py-16 transition-colors duration-300 bg-background text-text md:px-10 lg:px-20">
      
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Contact Us</h2>
          <p className="max-w-2xl mx-auto mt-3 text-text-secondary">
            Have questions or need help? Get in touch with us and we’ll respond as soon as possible.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <FiPhone className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-semibold">Phone / WhatsApp</h4>
                <p className="text-text-secondary">+20 123 456 7890</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <FiMail className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-semibold">Email</h4>
                <p className="text-text-secondary">support@bookstore.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <FiMapPin className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-semibold">Address</h4>
                <p className="text-text-secondary">123 Book Street, Cairo, Egypt</p>
              </div>
            </div>

            {/* Map */}
            <div className="w-full overflow-hidden shadow rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110498.08918791866!2d31.1884233!3d30.0595581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145840d6481e3a4d%3A0x4b3c93b8f311a2b!2sCairo!5e0!3m2!1sen!2seg!4v1631364543039!5m2!1sen!2seg"
                width="100%"
                height="250"
                allowFullScreen=""
                loading="lazy"
                className="border-0"
              ></iframe>
            </div>

            {/* Socials */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white">
                <FaFacebookF />
              </a>
              <a href="#" className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white">
                <FaTwitter />
              </a>
              <a href="#" className="p-3 transition rounded-full bg-surface hover:bg-primary hover:text-white">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 border shadow rounded-2xl bg-surface border-border">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

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
              name="subject"
              placeholder="Subject"
              value={formData.subject}
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
    </div>

  );
}