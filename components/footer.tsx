import { Globe, Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-[#222222] mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Safety information
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Cancellation options
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Report a concern
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#222222] mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  EventHub.org
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Disaster relief hosting
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Combating discrimination
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#222222] mb-4">Hosting</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Host an event
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Host resources
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Community forum
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Hosting responsibly
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#222222] mb-4">EventHub</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Newsroom
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  New features
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-[#717171] hover:text-[#222222] text-sm">
                  Investors
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-sm text-[#717171]">© 2024 EventHub, Inc.</p>
              <span className="text-[#717171]">·</span>
              <a href="#" className="text-sm text-[#717171] hover:text-[#222222]">
                Privacy
              </a>
              <span className="text-[#717171]">·</span>
              <a href="#" className="text-sm text-[#717171] hover:text-[#222222]">
                Terms
              </a>
              <span className="text-[#717171]">·</span>
              <a href="#" className="text-sm text-[#717171] hover:text-[#222222]">
                Sitemap
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-sm text-[#717171] hover:text-[#222222]">
                <Globe className="h-4 w-4" />
                <span>English (IN)</span>
                <span>₹ INR</span>
              </button>

              <div className="flex items-center space-x-3">
                <a href="#" className="text-[#717171] hover:text-[#222222]">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-[#717171] hover:text-[#222222]">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-[#717171] hover:text-[#222222]">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
