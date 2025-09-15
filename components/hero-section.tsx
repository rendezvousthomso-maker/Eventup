import { Search } from "lucide-react"

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

        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 p-2">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-300">
              <div className="flex-1 px-6 py-4">
                <label className="block text-xs font-semibold text-[#222222] mb-1">Where</label>
                <input
                  type="text"
                  placeholder="Search destinations"
                  className="w-full text-sm text-[#717171] placeholder-[#717171] bg-transparent border-none outline-none"
                />
              </div>
              <div className="flex-1 px-6 py-4">
                <label className="block text-xs font-semibold text-[#222222] mb-1">When</label>
                <input
                  type="text"
                  placeholder="Add dates"
                  className="w-full text-sm text-[#717171] placeholder-[#717171] bg-transparent border-none outline-none"
                />
              </div>
              <div className="flex-1 px-6 py-4">
                <label className="block text-xs font-semibold text-[#222222] mb-1">Who</label>
                <input
                  type="text"
                  placeholder="Add guests"
                  className="w-full text-sm text-[#717171] placeholder-[#717171] bg-transparent border-none outline-none"
                />
              </div>
              <div className="flex items-center px-2">
                <button
                  className="p-4 rounded-full transition-all duration-200 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #e61e4d 0%, #e31c5f 100%)", color: "#ffffff" }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
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
        </div>
      </div>
    </section>
  )
}
