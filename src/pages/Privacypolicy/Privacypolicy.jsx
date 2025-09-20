import React, { useState, useEffect } from 'react'
import he from 'he'
import { useApi } from '../../context/ApiContext'
import { useTranslation } from 'react-i18next'

export default function Privacypolicy() {
  const { request } = useApi()
  const { t, i18n } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bannerImage, setBannerImage] = useState("https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg")

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch privacy policy data
        const result = await request('privacypolicy')
        if (result && result.data && result.data.length > 0) {
          // ✅ فك ترميز الـ entities
          const decoded = result.data.map(item => ({
            ...item,
            description: he.decode(item.description)
          }))
          setData(decoded)
        }

        // Fetch settings for banner image
        try {
          const settingsResult = await request('setting')
          if (settingsResult && settingsResult.data && settingsResult.data.image_privacy_policy) {
            setBannerImage(settingsResult.data.image_privacy_policy)
          }
        } catch (settingsError) {
          console.error("Failed to fetch settings for banner:", settingsError)
          // Keep default banner image on error
        }

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPrivacyPolicy()
  }, [request, i18n.language]) // Add i18n.language dependency to re-fetch when language changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('privacyPolicy.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{t('privacyPolicy.error')}: {error}</div>
      </div>
    )
  }

  return (
    <div className="">
      <div
        className="relative w-full overflow-hidden bg-center bg-cover h-64 sm:h-80 md:h-96 lg:h-[400px]"
        style={{
          backgroundImage: `url("${bannerImage}")`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white sm:p-6">
          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
            {t('privacyPolicy.title')}
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
            {t('privacyPolicy.description')}
          </p>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="container px-4 py-8 mx-auto">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: data[0].description }}
          />
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          {t('privacyPolicy.noData')}
        </div>
      )}
    </div>
  )
}
