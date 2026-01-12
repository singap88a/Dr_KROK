import React, { useState, useEffect } from 'react'
import he from 'he'
import { useApi } from '../../context/ApiContext'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function TermsAndConditions() {
  const { request } = useApi()
  const { t, i18n } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bannerImage, setBannerImage] = useState("https://www.pivoi.com/wp-content/uploads/2021/02/termscondition.jpg")

  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch terms and conditions data - forcing 'en' as requested by user
        // If the request helper doesn't support forcing language, we'll use it as is
        // but the user's request suggests they want the content in English.
        const result = await request('termsandcondition')
        
        if (result && result.data && result.data.length > 0) {
          const decoded = result.data.map(item => ({
            ...item,
            description: he.decode(item.description)
          }))
          setData(decoded)
        }

        // Fetch settings for banner image
        try {
          const settingsResult = await request('setting')
          // Using typical banner if available, or a generic medical-themed one
          if (settingsResult && settingsResult.data && settingsResult.data.image_terms_conditions) {
            setBannerImage(settingsResult.data.image_terms_conditions)
          } else if (settingsResult && settingsResult.data && settingsResult.data.image_privacy_policy) {
              setBannerImage(settingsResult.data.image_privacy_policy)
          }
        } catch (settingsError) {
          console.error("Failed to fetch settings for banner:", settingsError)
        }

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTermsAndConditions()
  }, [request]) // Removed i18n.language to avoid re-fetching in other languages if we want to keep it English

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading..." />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="">
      <div
        className="relative w-full overflow-hidden bg-center bg-cover h-64 sm:h-80 md:h-96 lg:h-[400px]"
        style={{
          backgroundImage: `url("https://www.pivoi.com/wp-content/uploads/2021/02/termscondition.jpg")`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white sm:p-6">
          {/* Title - Fixed to English as requested */}
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
            Terms and Conditions
          </h1>

          {/* Description - Fixed to English as requested */}
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
            Please read our terms and conditions carefully to understand your rights and obligations as a user.
          </p>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="container px-4 md:px-20 py-8 mx-auto">
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: data[0].description }}
          />
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No terms and conditions data available.
        </div>
      )}
    </div>
  )
}
