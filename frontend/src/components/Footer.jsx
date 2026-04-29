import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Column 1 - About */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-wide">
              🇮🇳 JanRakshak
            </h2>
            <p className="text-sm leading-6 text-gray-400">
              JanRakshak is a Real-Time Crime Reporting System that empowers
              citizens to report incidents instantly and helps authorities
              respond faster for a safer community.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400 transition inline-block py-1">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition inline-block py-1">
                  Citizen Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-orange-400 transition inline-block py-1">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Emergency */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3">
              Emergency Contacts
            </h3>
            <div className="space-y-2 text-sm">
              <p className="py-1">🚓 Police: <span className="text-white font-medium">100</span></p>
              <p className="py-1">👩 Women Helpline: <span className="text-white font-medium">181</span></p>
              <p className="py-1">💻 Cyber Crime: <span className="text-white font-medium">1930</span></p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-5 text-center text-sm text-gray-400 space-y-3">
          <p>
            © {new Date().getFullYear()} JanRakshak | All Rights Reserved
          </p>

          {/* Subtle Admin Link */}
          <div className="text-xs text-gray-500">
            <Link
              to="/admin-access"
              className="hover:text-gray-300 transition inline-block py-1"
            >
              Admin Access
            </Link>
            <p className="text-xs mt-2 text-gray-500">Made with ❤️ for safer communities</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
