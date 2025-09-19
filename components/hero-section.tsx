// import { Search } from "lucide-react" // Currently unused
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-[#222222] mb-6 text-balance leading-tight">
            Discover & Host Events in{" "}
            <span className="text-transparent bg-gradient-to-r from-[#e61e4d] to-[#e31c5f] bg-clip-text">
              Bangalore
            </span>
          </h1>
          <p className="text-xl text-[#717171] mb-12 text-pretty max-w-2xl mx-auto leading-relaxed">
            Connect with your community through amazing events. From pet meetups to game nights, find your tribe and
            create unforgettable memories.
          </p>
        </div>

        <div className="text-center">
          <Link href="/create-event">
            <button
              className="font-semibold py-4 px-8 rounded-lg text-base transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #e61e4d 0%, #e31c5f 100%)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Host an Event
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
