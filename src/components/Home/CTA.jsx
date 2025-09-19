import React from "react";

function CTA() {
  return (
    <section id="cta" className="px-4 py-4">
      <div className="container mx-auto max-w-7xl">
        <div className="relative overflow-hidden border rounded-2xl bg-surface border-border">
          <div className="relative z-10 flex flex-col items-center justify-between gap-8 px-8 py-12 md:flex-row">
            
            {/* النص */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-extrabold md:text-4xl text-text">
                Start Your Journey with{" "}
                <span className="text-primary">Dr. Krok</span>
              </h3>
              <p className="max-w-lg mt-3 text-lg text-text-secondary">
                Join thousands of learners and earn recognized certificates. 
                Your first lesson is <span className="font-semibold text-text">completely free</span> — start today!
              </p>
            </div>

            {/* الزرار */}
            <div>
              <a
                href="#"
                className="px-8 py-3 font-semibold text-white transition shadow-md rounded-xl bg-primary hover:opacity-90"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* تأثير إضاءة */}
          <div className="absolute w-64 h-64 rounded-full -top-20 -left-20 bg-primary/20 blur-3xl"></div>
          <div className="absolute rounded-full -bottom-20 -right-20 w-72 h-72 bg-secondary/20 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}

export default CTA;
