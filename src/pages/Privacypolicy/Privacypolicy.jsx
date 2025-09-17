import React, { useState, useEffect } from 'react'
import he from 'he'

export default function Privacypolicy() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await fetch('https://dr-krok.hudurly.com/api/privacypolicy')
        if (!response.ok) {
          throw new Error('Failed to fetch privacy policy')
        }
        const result = await response.json()
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
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">Privacy Policy</h1>
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
