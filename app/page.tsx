"use client"

import { useEffect, useState } from "react"
import Iridescence from "@/components/iridsense"
import ButtonBlock from "@/components/button-block"
import SubscriptionHeader from "@/components/subscription-header"
import TiltedCard from "@/components/tilted-card"
import { useTelegramUser } from "@/hooks/use-telegram"

export default function Home() {
  // Используем хук для автоматической регистрации пользователя Telegram
  const { user, isLoading } = useTelegramUser()

  return (
    <main className="min-h-screen w-full flex flex-col justify-between relative bg-black overflow-x-hidden">
      {/* Iridescence background */}
      <div className="absolute inset-0 z-0">
        <Iridescence color={[1, 1, 1]} mouseReact={false} amplitude={0.1} speed={0.5} />
      </div>

      <div className="flex-1 p-4 z-10 relative flex flex-col">
        {/* Subscription header */}
        <SubscriptionHeader />

        {/* Main content area with TiltedCard */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            {isLoading ? (
              <div className="text-white text-xl">Загрузка...</div>
            ) : (
              <TiltedCard
                imageSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FreeBirdVPN%20logo-4l1BhHaGASaueOKhiP1Mv6CnE5oscF.png"
                altText="FreeBirdVPN Logo"
                containerHeight="300px"
                containerWidth="100%"
                imageHeight="250px"
                imageWidth="250px"
                scaleOnHover={1.15}
                rotateAmplitude={12}
                showMobileWarning={false}
                showTooltip={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom button block with gradient and rounded corners */}
      <div className="z-10 relative w-full px-6 sm:px-8 md:px-12 p-4 pb-8">
        <ButtonBlock />
      </div>
    </main>
  )
}
