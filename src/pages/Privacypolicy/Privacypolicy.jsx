import React, { useState, useEffect } from 'react'
import he from 'he'
import { useApi } from '../../context/ApiContext'

export default function Privacypolicy() {
  const { request } = useApi()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const result = await request('privacypolicy')
        // ✅ فك ترميز الـ entities
        const decoded = result.data.map(item => ({
          ...item,
          description: he.decode(item.description)
        }))
        setData(decoded)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPrivacyPolicy()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
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
    backgroundImage: `url("https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg")`,
  }}
>
  <div className="absolute inset-0 bg-black/50"></div>
  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white sm:p-6">
    {/* Title */}
    <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
      Privacy Policy
    </h1>

    {/* Description */}
    <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
      We value your privacy and are committed to protecting your personal data.
      This page explains how we collect, use, and safeguard your information
      when you interact with our website.
    </p>
  </div>
</div>

      {data && data.length > 0 ? (
        <div
           dangerouslySetInnerHTML={{ __html: data[0].description }}
        />
      ) : (
        <div className="text-center text-gray-500">No privacy policy data available.</div>
      )}
    </div>
  )
}
