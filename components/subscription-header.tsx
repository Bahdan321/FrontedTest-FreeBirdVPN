"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SpotlightCard from "@/components/stoplight-card"
import { useTelegramUser } from "@/hooks/use-telegram"

export default function SubscriptionHeader() {
  const router = useRouter()
  const { user, isLoading } = useTelegramUser()
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "FreeBirdVPN",
    status: "offline",
    dataUsage: "0 Мб",
    expiryDate: "3 мая 2025",
    isExpired: true,
  })

  // In a real app, you would fetch this data from your API
  useEffect(() => {
    if (user) {
      // Example of how you might fetch subscription data based on the user
      // This would be replaced with an actual API call
      const fetchSubscriptionData = async () => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Mock data - in a real app, this would come from your backend
          setSubscriptionData({
            plan: "FreeBirdVPN",
            status: "offline",
            dataUsage: "153 Мб",
            expiryDate: "3 мая 2025",
            isExpired: true,
          })
        } catch (error) {
          console.error("Failed to fetch subscription data:", error)
        }
      }

      fetchSubscriptionData()
    }
  }, [user])

  return (
    <SpotlightCard className="mb-6 p-4" spotlightColor="rgba(14, 165, 233, 0.2)">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-white text-xl font-bold">{subscriptionData.plan}</h2>
          <div className="flex items-center text-gray-400 text-sm mt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
            <span>{subscriptionData.status}</span>
            <span className="mx-2">•</span>
            <span>{subscriptionData.dataUsage}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-sm">до {subscriptionData.expiryDate}</p>
          <p className={`text-sm ${subscriptionData.isExpired ? "text-amber-500" : "text-sky-400"}`}>
            {subscriptionData.isExpired ? "подписка истекла" : "активна"}
          </p>
        </div>
      </div>
    </SpotlightCard>
  )
}
