import Link from "next/link"
import ShinyButton from "@/components/shiny-button"
import SpotlightCard from "@/components/stoplight-card"

export default function ButtonBlock() {
  return (
    <SpotlightCard
      className="rounded-t-3xl bg-gradient-to-b from-black/50 to-black p-6"
      spotlightColor="rgba(14, 165, 233, 0.2)"
    >
      <div className="max-w-md mx-auto space-y-4">
        {/* First row - Buy subscription */}
        <div>
          <Link href="/subscription">
            <ShinyButton
              text="Купить подписку"
              className="w-full rounded-xl py-6 text-lg font-medium bg-sky-300 hover:bg-sky-200 text-sky-950"
              speed={3}
            />
          </Link>
        </div>

        {/* Second row - Installation and setup */}
        <div>
          <Link href="/setup">
            <ShinyButton
              text="Установка и настройка"
              className="w-full rounded-xl py-6 text-lg font-medium bg-gradient-to-r from-sky-800 via-sky-700 to-sky-800 hover:from-sky-700 hover:via-sky-600 hover:to-sky-700 text-white"
              speed={4}
            />
          </Link>
        </div>

        {/* Third row - Profile and Support */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/profile">
            <ShinyButton
              text="Профиль"
              className="w-full py-6 text-lg font-medium bg-gradient-to-r from-sky-800 via-sky-700 to-sky-800 hover:from-sky-700 hover:via-sky-600 hover:to-sky-700 text-white rounded-xl"
              speed={5}
            />
          </Link>
          <ShinyButton
            text="Поддержка"
            className="w-full py-6 text-lg font-medium bg-gradient-to-r from-sky-800 via-sky-700 to-sky-800 hover:from-sky-700 hover:via-sky-600 hover:to-sky-700 text-white rounded-xl"
            speed={5}
          />
        </div>
      </div>
    </SpotlightCard>
  )
}
