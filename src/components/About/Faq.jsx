import React, { useState,   } from "react";
import {     FiPlus, FiMinus  } from "react-icons/fi";

export default function Faq() {
      const [openFAQ, setOpenFAQ] = useState(null);
 
 

  const faqs = [
    {
      question: "What is our platform?",
      answer: "Our platform is an online learning hub designed to provide high-quality educational resources, courses, and community support to learners worldwide."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for an account, browse our courses, and start learning at your own pace. Our platform is user-friendly and accessible on any device."
    },
    {
      question: "Are the courses free?",
      answer: "We offer a mix of free and premium courses. Free courses are available to all users, while premium ones provide advanced content and certifications."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we prioritize your privacy and security. All data is encrypted, and we comply with industry standards to protect your information."
    },
    {
      question: "Can I interact with instructors?",
      answer: "Absolutely! Our platform includes discussion forums, live sessions, and direct messaging with instructors to enhance your learning experience."
    }
  ];
  return (
    <div>
            {/* FAQ Section */}
            <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 sm:py-16">
              <h2 className="mb-8 text-2xl font-bold text-center sm:mb-10 sm:text-3xl text-primary">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="overflow-hidden transition-all duration-300 border border-gray-200 shadow-lg bg-surface rounded-2xl hover:shadow-xl">
                    <button
                      onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                      className="flex items-center justify-between w-full p-4 text-left transition-colors duration-200 sm:p-6 hover:bg-accent"
                    >
                      <span className="text-base font-semibold sm:text-lg text-text">{faq.question}</span>
                      <div className="transition-transform duration-300">
                        {openFAQ === index ? <FiMinus size={24} className="text-primary" /> : <FiPlus size={24} className="text-primary" />}
                      </div>
                    </button>
                    {openFAQ === index && (
                      <div className="px-4 pb-4 sm:px-6 sm:pb-6 animate-fade-in">
                        <p className="text-sm leading-relaxed text-text-secondary sm:text-base">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
    </div>
  )
}
