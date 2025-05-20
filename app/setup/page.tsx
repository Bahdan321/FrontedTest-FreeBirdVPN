"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Iridescence from "@/components/iridsense"
import ShinyButton from "@/components/shiny-button"
import SpotlightCard from "@/components/stoplight-card"
import { Cable, CloudDownload, Plus, Check, ArrowLeft, X } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [animatingProgress, setAnimatingProgress] = useState(false)
  const [displayStep, setDisplayStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [animatingOut, setAnimatingOut] = useState(false)

  const progressRef = useRef<SVGCircleElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      title: "Настройка на macOS",
      subtitle: "Настройка VPN происходит в 3 шага и занимает пару минут",
      icon: <Cable size={48} color="white" />,
      primaryButton: "Начать настройку на этом устройстве",
      secondaryButton: "Установить на другом устройстве",
      progress: 0,
    },
    {
      title: "Приложение",
      subtitle: "Установите приложение Happ и вернитесь к этому экрану",
      icon: <CloudDownload size={48} color="white" />,
      primaryButton: "Установить",
      primaryIcon: <CloudDownload size={20} className="ml-2" />,
      secondaryButton: "Далее",
      secondaryIcon: <span className="ml-2">→</span>,
      progress: 33,
    },
    {
      title: "Подписка",
      subtitle: "Добавьте подписку в приложение Happ с помощью кнопки ниже",
      icon: <Plus size={48} color="white" />,
      primaryButton: "Добавить",
      primaryIcon: <Plus size={20} className="ml-2" />,
      secondaryButton: "Далее",
      secondaryIcon: <span className="ml-2">→</span>,
      progress: 66,
    },
    {
      title: "Готово!",
      subtitle: "Нажмите на круглую кнопку включения VPN в приложении Happ",
      icon: (
        <div className="bg-sky-500 rounded-full p-4">
          <Check size={40} color="white" />
        </div>
      ),
      primaryButton: "Завершить настройку",
      progress: 100,
    },
  ]

  const currentStepData = steps[displayStep]

  // Animation for progress circle
  useEffect(() => {
    if (animatingProgress && progressRef.current) {
      const targetProgress = steps[currentStep].progress
      const startProgress = steps[displayStep].progress
      const duration = 1000 // 1 second
      const startTime = performance.now()

      const animate = (time: number) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smoother animation
        const easeOutQuad = (t: number) => t * (2 - t)
        const easedProgress = easeOutQuad(progress)

        const currentProgress = startProgress + (targetProgress - startProgress) * easedProgress

        if (progressRef.current) {
          progressRef.current.setAttribute("stroke-dasharray", `${currentProgress * 2.51} 251`)
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setAnimatingProgress(false)
          setDisplayStep(currentStep)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [animatingProgress, currentStep, displayStep, steps])

  // Animation for content transition
  useEffect(() => {
    if (animatingOut && contentRef.current) {
      const duration = 300 // 300ms

      // Animate out
      contentRef.current.style.transition = `opacity ${duration}ms, transform ${duration}ms`
      contentRef.current.style.opacity = "0"
      contentRef.current.style.transform = `translateX(${direction * -30}px)`

      const timer = setTimeout(() => {
        setDisplayStep(currentStep)
        setAnimatingOut(false)

        // Animate in
        if (contentRef.current) {
          contentRef.current.style.transform = `translateX(${direction * 30}px)`

          requestAnimationFrame(() => {
            if (contentRef.current) {
              contentRef.current.style.opacity = "1"
              contentRef.current.style.transform = "translateX(0)"
            }
          })
        }
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [animatingOut, currentStep, direction])

  const animateToNextStep = (nextStep: number) => {
    if (nextStep === currentStep) return

    const newDirection = nextStep > currentStep ? 1 : -1
    setDirection(newDirection)
    setAnimatingOut(true)
    setAnimatingProgress(true)
    setCurrentStep(nextStep)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      animateToNextStep(currentStep + 1)
    } else {
      router.push("/")
    }
  }

  const handlePrimaryAction = () => {
    if (currentStep === 1) {
      // Show install modal for the "Install" button in step 2
      setShowInstallModal(true)
    } else if (currentStep === 2) {
      // Redirect for the "Add" button in step 3
      // URL left empty as requested
      router.push("")
    } else {
      handleNext()
    }
  }

  const handleSecondary = () => {
    if (currentStep === 0) {
      // Handle "Install on another device" logic
    } else {
      handleNext()
    }
  }

  const handleInstallRedirect = () => {
    setShowInstallModal(false)
    // URL left empty as requested
    router.push("")
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative bg-black overflow-x-hidden">
      {/* Iridescence background */}
      <div className="absolute inset-0 z-0">
        <Iridescence color={[1, 1, 1]} mouseReact={false} amplitude={0.1} speed={0.3} />
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-10 text-white hover:text-sky-400 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="z-10 relative flex flex-col items-center justify-center w-full max-w-md px-6 py-12">
        {/* Progress circles */}
        <div className="relative w-64 h-64 mb-8">
          {/* Outer circle */}
          <div className="absolute inset-0 border border-sky-800/30 rounded-full"></div>

          {/* Middle circle */}
          <div className="absolute inset-8 border border-sky-800/50 rounded-full"></div>

          {/* Inner circle */}
          <div className="absolute inset-16 border border-sky-800/70 rounded-full"></div>

          {/* Progress arc */}
          {currentStepData.progress > 0 && (
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                ref={progressRef}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgb(14 165 233)" // sky-500
                strokeWidth="0.5"
                strokeDasharray={`${currentStepData.progress * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          )}

          {/* Icon container */}
          <div className="absolute inset-16 flex items-center justify-center">{currentStepData.icon}</div>
        </div>

        {/* Content block with text and buttons */}
        <div
          ref={contentRef}
          className="w-full transition-all duration-300 ease-out"
          style={{ opacity: 1, transform: "translateX(0)" }}
        >
          <SpotlightCard className="w-full p-6" spotlightColor="rgba(14, 165, 233, 0.2)">
            {/* Title */}
            <h1 className="text-white text-3xl font-bold mb-4 text-center">{currentStepData.title}</h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg mb-8 text-center">{currentStepData.subtitle}</p>

            {/* Primary button */}
            <div className="w-full mb-4">
              <ShinyButton
                text={currentStepData.primaryButton}
                className="w-full py-6 text-lg font-medium bg-sky-500 hover:bg-sky-400 text-white rounded-xl flex items-center justify-center"
                speed={4}
                onClick={handlePrimaryAction}
              />
            </div>

            {/* Secondary button */}
            {currentStepData.secondaryButton && (
              <div className="w-full">
                <ShinyButton
                  text={currentStepData.secondaryButton}
                  className="w-full py-6 text-lg font-medium bg-transparent border border-sky-800 hover:bg-sky-900/30 text-white rounded-xl flex items-center justify-center"
                  speed={4}
                  onClick={handleSecondary}
                />
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>

      {/* Installation modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <SpotlightCard className="w-full max-w-md p-6 relative" spotlightColor="rgba(14, 165, 233, 0.2)">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-white text-2xl font-bold mb-4 text-center">Важная информация</h2>

            <p className="text-gray-300 text-lg mb-8 text-center">
              После установки приложения v2RayTun, вернитесь на этот экран.
            </p>

            <ShinyButton
              text="Хорошо, перейти к установке"
              className="w-full py-6 text-lg font-medium bg-sky-500 hover:bg-sky-400 text-white rounded-xl"
              speed={4}
              onClick={handleInstallRedirect}
            />
          </SpotlightCard>
        </div>
      )}
    </main>
  )
}
