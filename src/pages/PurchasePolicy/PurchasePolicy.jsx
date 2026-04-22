import React, { useState, useEffect } from 'react'
import he from 'he'
import { useApi } from '../../context/ApiContext'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

export default function PurchasePolicy() {
  const { request } = useApi()
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [bannerImage, setBannerImage] = useState("https://www.pivoi.com/wp-content/uploads/2021/02/termscondition.jpg")

  useEffect(() => {
    const fetchPurchasePolicy = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await request('purchase_policy')

        if (result && result.data && result.data.length > 0) {
          const decoded = result.data.map(item => ({
            ...item,
            description: he.decode(item.description)
          }))
          setData(decoded)
        }

        try {
          const settingsResult = await request('setting')
          if (settingsResult && settingsResult.data) {
            if (settingsResult.data.image_purchase_policy) {
              setBannerImage(settingsResult.data.image_purchase_policy)
            } else if (settingsResult.data.image_terms_conditions) {
              setBannerImage(settingsResult.data.image_terms_conditions)
            }
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

    fetchPurchasePolicy()
  }, [request])

  if (loading) {
    return <LoadingSpinner fullScreen={true} text={t('common.loading')} />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{t('common.error')}: {error}</div>
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
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
            {t('footer.purchasePolicy')}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
            {t('purchasePolicy.description')}
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
          {t('purchasePolicy.noData')}
        </div>
      )}
    </div>
  )
}
