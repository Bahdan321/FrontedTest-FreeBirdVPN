"use client"

import type React from "react"

import { useState } from "react"
import { redirect, useRouter } from "next/navigation"
import Iridescence from "@/components/iridsense"
import SpotlightCard from "@/components/stoplight-card"
import ShinyButton from "@/components/shiny-button"
import { ArrowLeft, X, Tag } from "lucide-react"
import subscriptionService, { type SubscriptionRequestData } from "../../services/subscription.service"

export default function SubscriptionPage() {
  const router = useRouter()
  const [deviceCount, setDeviceCount] = useState(3)
  const [selectedPlan, setSelectedPlan] = useState(2) // Default to 6 months (index 2)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false) // New state for success modal
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false) // New state for payment processing
  const [gigabitConnection, setGigabitConnection] = useState(false)
  const [additionalCountries, setAdditionalCountries] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  // Base prices per device per month
  const basePrices = [
    { period: "1 месяц", price: 310, perMonth: 310, durationInMonths: 1 },
    { period: "3 месяца", price: 790, perMonth: 263, durationInMonths: 3 },
    { period: "6 месяцев", price: 1470, perMonth: 245, popular: true, durationInMonths: 6 },
    { period: "1 год", price: 2700, perMonth: 225, durationInMonths: 12 },
  ]

  // Calculate actual prices based on device count and add-ons
  const calculatePrice = (basePrice: number) => {
    let price = basePrice * deviceCount

    // Add gigabit connection price if selected
    if (gigabitConnection) {
      price += 100
    }

    // Add additional countries price
    if (additionalCountries) {
      price += 100
    }

    // Apply promo code discount if valid
    if (promoApplied) {
      price = Math.round(price * 0.9) // 10% discount for example
    }

    return Math.round(price)
  }

  const plans = basePrices.map((plan) => ({
    ...plan,
    price: calculatePrice(plan.price),
    perMonth: Math.round(calculatePrice(plan.perMonth)),
  }))

  const handleDeviceCountChange = (count: number) => {
    setDeviceCount(count)
  }

  const handlePlanSelect = (index: number) => {
    setSelectedPlan(index)
  }


  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  }

  const handleBankCardPayment = async () => {
    setIsPaymentProcessing(true);
    const selectedPlanDetails = basePrices[selectedPlan];
    if (!selectedPlanDetails) {
      console.error("Selected plan details not found");
      // Можно показать ошибку пользователю
      setShowPaymentModal(false);
      return;
    }

    const payload: SubscriptionRequestData = {
      devices: deviceCount,
      duration_months: selectedPlanDetails.durationInMonths,
      gigabit_connection: gigabitConnection,
      all_regions: additionalCountries,
    };

    try {
      console.log("Attempting to create subscription with payload:", payload);
      const response = await subscriptionService.createSubscription(payload);
      console.log("Subscription creation successful:", response);
      setShowPaymentModal(false);
      setShowSuccessModal(true); // Show success modal
      // Здесь можно обработать успешный ответ, например, показать сообщение или перейти на другую страницу
    } catch (error) {
      console.error("Subscription creation failed:", error);
      // Здесь можно обработать ошибку, например, показать сообщение пользователю
      setShowPaymentModal(false);
    } finally {
      setIsPaymentProcessing(false);
    }
  }

  const handleGigabitChange = () => {
    setGigabitConnection(!gigabitConnection)
  }

  const handleCountriesChange = () => {
    setAdditionalCountries(!additionalCountries)
  }

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value)
  }

  const applyPromoCode = () => {
    if (promoCode.trim().length > 0) {
      setPromoApplied(true)
    }
  }

  return (
    <main className="min-h-screen w-full flex flex-col relative bg-black overflow-x-hidden">
      {/* Iridescence background */}
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
        <h1 className="text-white text-3xl font-bold mb-4">Покупка подписки</h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg mb-8 text-center">Выберите интересующий тариф и количество устройств</p>

        {/* Device count in a separate block */}
        <SpotlightCard className="w-full mb-8 p-6" spotlightColor="rgba(14, 165, 233, 0.2)">
          <h2 className="text-white text-xl mb-4">Количество устройств</h2>
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => handleDeviceCountChange(count)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${deviceCount === count ? "bg-sky-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {count}
              </button>
            ))}
          </div>
        </SpotlightCard>

        {/* Additional options */}
        <SpotlightCard className="w-full mb-8 p-6" spotlightColor="rgba(14, 165, 233, 0.2)">
          <h2 className="text-white text-xl mb-4">Дополнительные опции</h2>

          {/* Gigabit connection toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-lg">Гигабитное соединение</h3>
              <p className="text-gray-400 text-sm">Увеличенная скорость соединения</p>
            </div>
            <div className="flex items-center">
              <span className="text-sky-500 mr-3">+100 ₽</span>
              <button
                onClick={handleGigabitChange}
                className={`relative w-14 h-8 rounded-full transition-colors ${gigabitConnection ? "bg-sky-500" : "bg-gray-700"
                  }`}
              >
                <span
                  className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${gigabitConnection ? "left-7" : "left-1"
                    }`}
                ></span>
              </button>
            </div>
          </div>

          {/* Additional countries toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg">Дополнительные страны</h3>
              <p className="text-gray-400 text-sm">Доступ к серверам в дополнительных странах</p>
            </div>
            <div className="flex items-center">
              <span className="text-sky-500 mr-3">+100 ₽</span>
              <button
                onClick={handleCountriesChange}
                className={`relative w-14 h-8 rounded-full transition-colors ${additionalCountries ? "bg-sky-500" : "bg-gray-700"
                  }`}
              >
                <span
                  className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${additionalCountries ? "left-7" : "left-1"
                    }`}
                ></span>
              </button>
            </div>
          </div>
        </SpotlightCard>

        {/* Subscription plans */}
        <SpotlightCard className="w-full mb-8 p-6" spotlightColor="rgba(14, 165, 233, 0.2)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {plans.map((plan, index) => (
              <div key={index} onClick={() => handlePlanSelect(index)} className="cursor-pointer">
                <SpotlightCard
                  className={`rounded-xl transition-all ${selectedPlan === index ? "border-sky-500 border-2" : "border-gray-800"
                    }`}
                  spotlightColor="rgba(14, 165, 233, 0.2)"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      ПОПУЛЯРНЫЙ
                    </div>
                  )}
                  <div className="flex flex-col items-center p-4">
                    <p className="text-white text-xl mb-4">{plan.period}</p>
                    <p className="text-white text-4xl font-bold mb-2">{plan.price} ₽</p>
                    {index > 0 && <p className="text-gray-400 text-sm">{plan.perMonth}₽ в месяц</p>}
                  </div>
                </SpotlightCard>
              </div>
            ))}
          </div>
        </SpotlightCard>

        <SpotlightCard className="w-full mb-8 p-6" spotlightColor="rgba(14, 165, 233, 0.2)">
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-4">
              <label htmlFor="promo" className="text-white text-lg block mb-2">
                Промокод
              </label>
              <div className="relative">
                <input
                  id="promo"
                  type="text"
                  value={promoCode}
                  onChange={handlePromoCodeChange}
                  disabled={promoApplied}
                  placeholder="Введите промокод"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-sky-500"
                />
                <Tag className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <button
              onClick={applyPromoCode}
              disabled={promoApplied || promoCode.trim().length === 0}
              className={`px-6 py-3 rounded-xl transition-colors ${promoApplied ? "bg-sky-700 text-white cursor-not-allowed" : "bg-sky-600 hover:bg-sky-500 text-white"
                }`}
            >
              {promoApplied ? "Применен" : "Применить"}
            </button>
          </div>
          {promoApplied && <p className="text-sky-500 mt-2">Промокод применен! Скидка 10%</p>}
        </SpotlightCard>

        {/* Payment button */}
        <div className="w-full">
          <ShinyButton
            text={`Оплатить ${plans[selectedPlan].price} ₽`}
            className="w-full py-6 text-xl font-medium bg-gradient-to-r from-sky-800 via-sky-600 to-sky-800 hover:from-sky-700 hover:via-sky-500 hover:to-sky-700 text-white rounded-xl"
            speed={4}
            onClick={handlePaymentClick}
          />
        </div>
      </div>

      {/* Payment method modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <SpotlightCard className="w-full max-w-md p-6 relative" spotlightColor="rgba(14, 165, 233, 0.2)">
            <button
              onClick={() => !isPaymentProcessing && setShowPaymentModal(false)}
              className={`absolute top-4 right-4 text-gray-400 hover:text-white ${isPaymentProcessing ? "cursor-not-allowed" : ""}`}
              disabled={isPaymentProcessing}
            >
              <X size={24} />
            </button>

            <h2 className="text-white text-2xl font-bold mb-6 text-center">Выберите способ оплаты</h2>

            {isPaymentProcessing ? (
              <div className="flex flex-col items-center justify-center h-40">
                <svg className="animate-spin h-10 w-10 text-sky-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-white text-lg">Обработка платежа...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <PaymentOption
                  title="Рубли"
                  description="Оплата банковской картой"
                  price={plans[selectedPlan].price}
                  onClick={handleBankCardPayment}
                  disabled={isPaymentProcessing}
                />

                <PaymentOption
                  title="TG Звездочки"
                  description="Оплата через Telegram"
                  price={Math.round(plans[selectedPlan].price / 10)}
                  currency="⭐️"
                  onClick={() => {
                    console.log("Оплата TG Звездочками выбрана");
                    setShowPaymentModal(false);
                  }}
                  disabled={isPaymentProcessing}
                />

                <PaymentOption
                  title="Криптовалюта"
                  description="BTC, ETH, USDT, TON"
                  price={Math.round(plans[selectedPlan].price / 100)}
                  currency="USDT"
                  onClick={() => {
                    console.log("Оплата криптовалютой выбрана");
                    setShowPaymentModal(false);
                  }}
                  disabled={isPaymentProcessing}
                />
              </div>
            )}
          </SpotlightCard>
        </div>
      )}

      {/* Success Payment Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <SpotlightCard className="w-full max-w-md p-6 relative text-center" spotlightColor="rgba(14, 165, 233, 0.2)">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">Оплата прошла успешно!</h2>
            <p className="text-gray-300 mb-6">Ваша подписка активирована. Спасибо за покупку!</p>
            <ShinyButton
              text="Отлично"
              onClick={() => redirect("/")}
              className="w-full py-3 text-lg font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-xl"
            />
          </SpotlightCard>
        </div>
      )}
    </main>
  )
}

interface PaymentOptionProps {
  title: string
  description: string
  price: number
  currency?: string
  onClick: () => void
  disabled?: boolean
}

function PaymentOption({ title, description, price, currency = "₽", onClick, disabled = false }: PaymentOptionProps) {
  return (
    <div onClick={!disabled ? onClick : undefined} className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <SpotlightCard
        className={`p-4 ${!disabled ? 'hover:border-sky-500' : ''} transition-colors`}
        spotlightColor="rgba(14, 165, 233, 0.2)"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white text-lg font-medium">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
          <div className="text-white text-xl font-bold">
            {price} {currency}
          </div>
        </div>
      </SpotlightCard>
    </div>
  )
}
