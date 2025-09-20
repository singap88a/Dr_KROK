import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";

function CTA() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const { isLoggedIn } = useUser();
  const [ctaData, setCtaData] = useState(null);

  useEffect(() => {
    const fetchCTAData = async () => {
      try {
        const result = await request('setting');
        if (result && result.data) {
          setCtaData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch CTA settings:", error);
      }
    };

    fetchCTAData();
  }, [request, i18n.language]);

  return (
    <section id="cta" className="px-4 py-4">
      <div className="container mx-auto max-w-7xl">
        <div className="relative overflow-hidden border rounded-2xl bg-surface border-border">
          <div className="relative z-10 flex flex-col items-center justify-between gap-8 px-8 py-12 md:flex-row">

            {/* النص */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-extrabold md:text-4xl text-text">
                {ctaData?.description_section_start_your_journey_home ? (
                  <>
                    {t('cta.title')}{" "}
                    <span className="text-primary">{t('cta.titleHighlight')}</span>
                  </>
                ) : (
                  <>
                    {t('cta.title')}{" "}
                    <span className="text-primary">{t('cta.titleHighlight')}</span>
                  </>
                )}
              </h3>
              <p className="max-w-3xl mt-3 text-lg text-text-secondary">
                {ctaData?.description_section_start_your_journey_home ? (
                  <>
                    {ctaData.description_section_start_your_journey_home.split(t('cta.descriptionHighlight')).map((part, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <span className="font-semibold text-text">{t('cta.descriptionHighlight')}</span>}
                        {part}
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <>
                    {t('cta.description').split(t('cta.descriptionHighlight')).map((part, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <span className="font-semibold text-text">{t('cta.descriptionHighlight')}</span>}
                        {part}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </p>
            </div>

            {/* الزرار */}
            <div>
              {!isLoggedIn ? (
                <Link
                  to="/register"
                  className="px-8 py-3 font-semibold text-white transition shadow-md rounded-xl bg-primary hover:opacity-90"
                >
                  {t('cta.button.getStarted')}
                </Link>
              ) : (
                <Link
                  to="/courses"
                  className="px-8 py-3 font-semibold text-white transition shadow-md rounded-xl bg-primary hover:opacity-90"
                >
                  {t('cta.button.goToCourses')}
                </Link>
              )}
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
