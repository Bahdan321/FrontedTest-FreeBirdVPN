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

// Интерфейс для токенов авторизации
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in?: number
}

export function useTelegramUser() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)

  // Функция для регистрации пользователя на бэкенде
  // ВАЖНО: Эта функция должна вызываться только с реальными данными пользователя Telegram
  // Моковые данные используются только для локального тестирования UI и не должны отправляться на бэкенд
  const registerTelegramUser = async (telegramUser: TelegramUser) => {
    try {
      // URL вашего FastAPI бэкенда
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://a2aa733d4f568af200723c9515cef335.serveo.net'

      // Отправляем данные пользователя на бэкенд для регистрации
      const response = await fetch(`${apiUrl}/auth/telegram/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || '',
          username: telegramUser.username || '',
        }),
      })

      if (!response.ok) {
        throw new Error(`Ошибка регистрации: ${response.status}`)
      }

      const data = await response.json()
      return data as AuthTokens
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error)
      throw error
    }
  }

  // Сохранение токенов в localStorage
  const saveTokens = (authTokens: AuthTokens) => {
    localStorage.setItem('auth_tokens', JSON.stringify(authTokens))
    setTokens(authTokens)
  }

  // Получение токенов из localStorage
  const getTokensFromStorage = (): AuthTokens | null => {
    if (typeof window === 'undefined') return null

    const storedTokens = localStorage.getItem('auth_tokens')
    if (storedTokens) {
      try {
        return JSON.parse(storedTokens) as AuthTokens
      } catch (e) {
        console.error('Ошибка при парсинге токенов:', e)
        return null
      }
    }
    return null
  }

  // Функция для проверки загрузки скрипта Telegram WebApp
  const checkTelegramWebAppScript = () => {
    return new Promise<boolean>((resolve) => {
      // Если скрипт уже загружен
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Скрипт Telegram WebApp уже загружен')
        resolve(true)
        return
      }

      // Если скрипт не загружен, пробуем загрузить его динамически
      console.log('Скрипт Telegram WebApp не обнаружен, пробуем загрузить динамически')
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-web-app.js'
      script.async = true

      script.onload = () => {
        console.log('Скрипт Telegram WebApp успешно загружен динамически')
        // Даем время на инициализацию
        setTimeout(() => {
          if (window.Telegram && window.Telegram.WebApp) {
            console.log('Telegram WebApp успешно инициализирован после динамической загрузки')
            resolve(true)
          } else {
            console.log('Telegram WebApp не инициализирован после загрузки скрипта')
            resolve(false)
          }
        }, 500) // Небольшая задержка для инициализации
      }

      script.onerror = () => {
        console.error('Ошибка при загрузке скрипта Telegram WebApp')
        resolve(false)
      }

      document.head.appendChild(script)
    })
  }

  // Функция для проверки, открыто ли приложение через Telegram Mini App
  const isTelegramMiniApp = () => {
    if (typeof window === 'undefined') return false

    // Проверяем URL-параметры, которые обычно присутствуют при открытии через Telegram
    const url = new URL(window.location.href)
    const tgWebAppData = url.searchParams.get('tgWebAppData')
    const tgWebAppVersion = url.searchParams.get('tgWebAppVersion')

    // Если есть параметры Telegram, значит приложение открыто через Telegram
    if (tgWebAppData || tgWebAppVersion) {
      console.log('Обнаружены URL-параметры Telegram Mini App')
      return true
    }

    // Проверяем User-Agent на наличие признаков Telegram
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('telegram') || userAgent.includes('tgweb')) {
      console.log('Обнаружен User-Agent Telegram')
      return true
    }

    return false
  }

  useEffect(() => {
    const initTelegram = async () => {
      try {
        setIsLoading(true)

        // Проверяем наличие сохраненных токенов
        const storedTokens = getTokensFromStorage()
        if (storedTokens) {
          setTokens(storedTokens)
          console.log('Токены загружены из localStorage')
        }

        // Проверяем, открыто ли приложение через Telegram
        const isTelegramApp = isTelegramMiniApp()
        console.log('Приложение открыто через Telegram Mini App:', isTelegramApp)

        // Подробное логирование для отладки
        console.log('Проверка window.Telegram:', typeof window.Telegram)
        console.log('Проверка window объекта:', Object.keys(window).includes('Telegram'))
        console.log('URL параметры:', window.location.search)
        console.log('User-Agent:', navigator.userAgent)

        // Проверяем и при необходимости загружаем скрипт Telegram WebApp
        const isScriptLoaded = await checkTelegramWebAppScript()

        if (!isScriptLoaded) {
          console.log('Не удалось загрузить скрипт Telegram WebApp')

          if (isTelegramApp) {
            console.log('Приложение открыто через Telegram, но скрипт WebApp не загрузился')
            console.log('Возможно, проблема с сетью или версией Telegram')
          } else {
            console.log('Приложение открыто не в Telegram. Для полной функциональности откройте через Telegram')
          }

          setIsLoading(false)
          return
        }

        // Проверяем, запущено ли приложение в среде Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
          console.log('Telegram WebApp обнаружен!')
          const tg = window.Telegram.WebApp

          // Логируем доступные свойства WebApp
          console.log('WebApp свойства:', {
            initDataAvailable: !!tg.initData,
            initDataUnsafeAvailable: !!tg.initDataUnsafe,
            userAvailable: tg.initDataUnsafe && !!tg.initDataUnsafe.user
          })

          // Сообщаем Telegram WebApp, что мы готовы
          tg.ready()
          console.log('Вызван метод tg.ready()')

          // Получаем данные пользователя из Telegram WebApp
          if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const telegramUser = tg.initDataUnsafe.user
            console.log('Получены данные пользователя Telegram:', telegramUser)
            setUser(telegramUser)

            // Регистрируем пользователя и получаем токены
            try {
              // Если токены не найдены в localStorage, регистрируем пользователя
              if (!storedTokens) {
                console.log('Начинаем регистрацию пользователя Telegram...')
                const authTokens = await registerTelegramUser(telegramUser)
                saveTokens(authTokens)
                console.log('Пользователь успешно зарегистрирован через Telegram')
              }
            } catch (regError) {
              console.error('Ошибка при регистрации через Telegram:', regError)
            }
          } else {
            // Если данные пользователя недоступны в Telegram WebApp
            console.log("Данные пользователя Telegram недоступны")
            if (tg.initDataUnsafe) {
              console.log('initDataUnsafe доступен, но user отсутствует:', tg.initDataUnsafe)
            } else {
              console.log('initDataUnsafe недоступен. Возможно, приложение открыто не через Telegram')

              if (isTelegramApp) {
                console.log('Хотя приложение открыто через Telegram, initDataUnsafe не доступен')
                console.log('Проверьте настройки вашего Telegram бота и параметры запуска Mini App')
              }
            }
            // Не устанавливаем моковые данные, оставляем user = null
          }
        } else {
          // Если приложение не запущено в среде Telegram WebApp
          console.log("Приложение не запущено в Telegram WebApp")

          if (isTelegramApp) {
            console.log('Хотя приложение открыто через Telegram, WebApp API не инициализирован')
            console.log('Проверьте настройки вашего Telegram бота и параметры запуска Mini App')
            console.log('Убедитесь, что в вашем боте включены Web App и правильно настроены параметры запуска')

            // Проверяем, есть ли в URL параметр tgWebAppStartParam
            const url = new URL(window.location.href)
            const startParam = url.searchParams.get('tgWebAppStartParam')
            if (startParam) {
              console.log('Обнаружен параметр запуска:', startParam)
            } else {
              console.log('Параметр запуска tgWebAppStartParam отсутствует')
              console.log('Это может быть причиной проблемы с инициализацией WebApp')
            }
          } else {
            console.log('Для полной функциональности откройте приложение через Telegram')
            console.log('Используйте ссылку вида https://t.me/your_bot_name/app')
          }

          // В режиме разработки автоматически создаем тестового пользователя
          if (process.env.NODE_ENV === 'development') {
            console.log('Режим разработки: создаем тестового пользователя для отладки UI')
            const testUser: TelegramUser = {
              id: 12345,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              language_code: 'ru'
            }
            setUser(testUser)
            console.log('Тестовый пользователь создан:', testUser)
          }
        }
      } catch (err) {
        console.error("Ошибка инициализации Telegram WebApp:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    initTelegram()
  }, [])

  // Функция для обновления токенов (например, при истечении срока действия)
  const refreshTokens = async () => {
    try {
      if (!tokens?.refresh_token) {
        throw new Error('Отсутствует refresh_token')
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: tokens.refresh_token,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ошибка обновления токена: ${response.status}`)
      }

      const newTokens = await response.json() as AuthTokens
      saveTokens(newTokens)
      return newTokens
    } catch (error) {
      console.error('Ошибка при обновлении токенов:', error)
      // При ошибке обновления токенов, удаляем сохраненные токены
      localStorage.removeItem('auth_tokens')
      setTokens(null)
      throw error
    }
  }

  // Функция для выхода из системы
  const logout = () => {
    localStorage.removeItem('auth_tokens')
    setTokens(null)
  }

  return { user, isLoading, error, tokens, refreshTokens, logout }
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
