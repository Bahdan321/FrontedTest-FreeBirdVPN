"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Iridescence from "@/components/iridsense"
import SpotlightCard from "@/components/stoplight-card"
import ShinyButton from "@/components/shiny-button"
import { ArrowLeft, User, Mail, Globe, Calendar, Shield } from "lucide-react"
import { useTelegramUser, useTelegramBackButton } from "@/hooks/use-telegram"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useTelegramUser()
  useTelegramBackButton(true)

  const [subscriptionData, setSubscriptionData] = useState({
    plan: "FreeBirdVPN",
    status: "offline",
    dataUsage: "153 Мб",
    expiryDate: "3 мая 2025",
    isExpired: true,
    devices: 3,
    countries: 65,
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
            devices: 3,
            countries: 65,
          })
        } catch (error) {
          console.error("Failed to fetch subscription data:", error)
        }
      }

      fetchSubscriptionData()
    }
  }, [user])

  if (isLoading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center relative bg-black overflow-x-hidden">
        <div className="absolute inset-0 z-0">
          <Iridescence color={[1, 1, 1]} mouseReact={false} amplitude={0.1} speed={0.3} />
        </div>
        <div className="z-10 text-white text-xl">Загрузка...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full flex flex-col relative bg-black overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <Iridescence color={[1, 1, 1]} mouseReact={false} amplitude={0.1} speed={0.3} />
      </div>

      <div className="flex-1 z-10 relative flex flex-col items-center justify-start p-6 pt-12 max-w-3xl mx-auto w-full">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 left-6 text-white hover:text-sky-400 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Title */}
        <h1 className="text-white text-3xl font-bold mb-8">Профиль</h1>

        {/* User info */}
        <SpotlightCard className="w-full mb-8 p-6" spotlightColor="rgba(14, 165, 233, 0.2)">
          <div className="flex items-center mb-6">
            {user?.photo_url ? (
              <img
                src={user.photo_url || "/placeholder.svg"}
                alt={user.first_name}
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-sky-800 flex items-center justify-center mr-4">
                <User size={32} className="text-white" />
              </div>
            )}
            <div>
              <h2 className="text-white text-xl font-bold">
                {user?.first_name} {user?.last_name || ""}
              </h2>
              {user?.username && <p className="text-gray-400">@{user.username}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="text-sky-400 mr-3" size={20} />
              <span className="text-white">ID: {user?.id}</span>
            </div>
            {user?.language_code && (
              <div className="flex items-center">
                <Globe className="text-sky-400 mr-3" size={20} />
                <span className="text-white">Язык: {user.language_code.toUpperCase()}</span>
              </div>
            )}
          </div>
        </SpotlightCard>

        {/* Subscription info */}
        <SpotlightCard className="w-full mb-8 p-6" spotlightColor="rgba(14, 165, 233, 0.2)">
          <h2 className="text-white text-xl font-bold mb-4">Информация о подписке</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Shield className="text-sky-400 mr-3" size={20} />
                <span className="text-white">Тариф</span>
              </div>
              <span className="text-white">{subscriptionData.plan}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="text-sky-400 mr-3" size={20} />
                <span className="text-white">Действует до</span>
              </div>
              <span className={subscriptionData.isExpired ? "text-amber-500" : "text-white"}>
                {subscriptionData.expiryDate}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <User className="text-sky-400 mr-3" size={20} />
                <span className="text-white">Устройства</span>
              </div>
              <span className="text-white">{subscriptionData.devices}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Globe className="text-sky-400 mr-3" size={20} />
                <span className="text-white">Страны</span>
              </div>
              <span className="text-white">{subscriptionData.countries}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Mail className="text-sky-400 mr-3" size={20} />
                <span className="text-white">Использовано</span>
              </div>
              <span className="text-white">{subscriptionData.dataUsage}</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Actions */}
        <div className="w-full space-y-4">
          <ShinyButton
            text="Продлить подписку"
            className="w-full py-6 text-lg font-medium bg-sky-500 hover:bg-sky-400 text-white rounded-xl"
            speed={4}
            onClick={() => router.push("/subscription")}
          />

          <ShinyButton
            text="Выйти"
            className="w-full py-6 text-lg font-medium bg-transparent border border-sky-800 hover:bg-sky-900/30 text-white rounded-xl"
            speed={4}
            onClick={() => {
              // Handle logout logic here
              router.push("/")
            }}
          />
        </div>
      </div>
    </main>
  )
}
