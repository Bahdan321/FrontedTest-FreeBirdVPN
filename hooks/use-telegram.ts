"use client"

import { useState, useEffect } from "react"

// Define the Telegram WebApp interface
interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      photo_url?: string
    }
    auth_date: number
    hash: string
  }
  ready(): void
  expand(): void
  close(): void
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive: boolean): void
    hideProgress(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    setText(text: string): void
    setParams(params: { text?: string; color?: string; textColor?: string }): void
  }
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  HapticFeedback: {
    impactOccurred(style: string): void
    notificationOccurred(type: string): void
    selectionChanged(): void
  }
  onEvent(eventType: string, callback: () => void): void
  offEvent(eventType: string, callback: () => void): void
}

// Extend the Window interface to include Telegram.WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export function useTelegramUser() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initTelegram = async () => {
      try {
        setIsLoading(true)

        // Check if running in Telegram WebApp environment
        if (window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp

          // Tell Telegram WebApp we're ready
          tg.ready()

          // Get user data from Telegram WebApp
          if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            setUser(tg.initDataUnsafe.user)
          } else {
            // For development/testing outside of Telegram
            console.log("No Telegram user data available, using mock data")
            setUser({
              id: 12345678,
              first_name: "Test",
              last_name: "User",
              username: "testuser",
              language_code: "en",
            })
          }
        } else {
          // For development/testing outside of Telegram
          console.log("Not running in Telegram WebApp, using mock data")
          setUser({
            id: 12345678,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            language_code: "en",
          })
        }
      } catch (err) {
        console.error("Error initializing Telegram WebApp:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    initTelegram()
  }, [])

  return { user, isLoading, error }
}

export function useTelegramBackButton(isVisible = false) {
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const backButton = window.Telegram.WebApp.BackButton

      if (isVisible) {
        backButton.show()
      } else {
        backButton.hide()
      }

      return () => {
        backButton.hide()
      }
    }
  }, [isVisible])
}

export function useTelegramMainButton(params: {
  text: string
  isVisible?: boolean
  isActive?: boolean
  color?: string
  textColor?: string
  onClick?: () => void
}) {
  const { text, isVisible = true, isActive = true, color = "#2CABEE", textColor = "#ffffff", onClick } = params

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const mainButton = window.Telegram.WebApp.MainButton

      mainButton.setParams({
        text,
        color,
        textColor,
      })

      if (isVisible) {
        mainButton.show()
      } else {
        mainButton.hide()
      }

      if (isActive) {
        mainButton.enable()
      } else {
        mainButton.disable()
      }

      if (onClick) {
        mainButton.onClick(onClick)
      }

      return () => {
        if (onClick) {
          mainButton.offClick(onClick)
        }
        mainButton.hide()
      }
    }
  }, [text, isVisible, isActive, color, textColor, onClick])
}
