import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { getUser, userIsAuthenticated, userLogout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const logout = () => {
    userLogout()
    setMobileMenuOpen(false)
  }

  const isAuthenticated = userIsAuthenticated()
  const user = getUser()
  const userName = user ? user.data.name : ''

  const isAdmin = user && user.data.rol[0] === 'ADMIN'
  const isUser = user && user.data.rol[0] === 'USER'

  // Function to get appropriate greeting and icon based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      return {
        text: "Good morning",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
        )
      }
    } else if (hour >= 12 && hour < 16) {
      return {
        text: "Good afternoon",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v2"></path>
            <path d="M12 21v2"></path>
            <path d="M4.22 4.22l1.42 1.42"></path>
            <path d="M18.36 18.36l1.42 1.42"></path>
            <path d="M1 12h2"></path>
            <path d="M21 12h2"></path>
            <path d="M4.22 19.78l1.42-1.42"></path>
            <path d="M18.36 5.64l1.42-1.42"></path>
          </svg>
        )
      }
    } else if (hour >= 16 && hour < 22) {
      return {
        text: "Good evening",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        )
      }
    } else {
      return {
        text: "Good night",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            <path d="M9 15 3 9"></path>
            <path d="m15 9-3-3"></path>
            <path d="m21 15-3-3"></path>
            <path d="M3 21 21 3"></path>
          </svg>
        )
      }
    }
  }

  const greeting = getTimeBasedGreeting()

  return (
    <nav className="bg-orange-950 text-white">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-6">
            <span className="font-bold text-xl transition-transform duration-300 hover:scale-110 cursor-pointer">SV</span>
            <Link to="/" className="relative py-1 overflow-hidden group">
              <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300 text-blue-200">Home</span>
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/playlist" className="relative py-1 overflow-hidden group">
              <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300 text-blue-200">Playlists</span>
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {isAdmin && (
              <Link to="/adminpage" className="relative py-1 overflow-hidden group">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">AdminPage</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            {isUser && (
              <Link to="/userpage" className="relative py-1 overflow-hidden group">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">Dashboard</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </div>
          {/* Right Side */}
          <div className="flex items-center space-x-6">
            {!isAuthenticated && (
              <>
                <Link to="/login" className="relative py-1 overflow-hidden group">
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">Login</span>
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/signup" className="relative py-1 overflow-hidden group">
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">Sign Up</span>
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <div className="flex items-center space-x-2 font-medium transition-transform duration-300 hover:scale-105">
                  {greeting.icon}
                  <span>{`${greeting.text}, ${userName}`}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="relative py-1 overflow-hidden group"
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">Logout</span>
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between">
          <span className="font-bold text-xl transition-transform duration-300 hover:scale-110 cursor-pointer">SV</span>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="focus:outline-none transition-transform duration-300 hover:scale-110"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu - with smooth height transition */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-3 space-y-3 flex flex-col border-t border-orange-800 mt-4">
            <Link 
              to="/" 
              className="py-2 hover:text-orange-300 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/playlist" 
              className="py-2 hover:text-orange-300 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Playlists
            </Link>
            {isAdmin && (
              <Link 
                to="/adminpage" 
                className="py-2 hover:text-orange-300 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                AdminPage
              </Link>
            )}
            {isUser && (
              <Link 
                to="/userpage" 
                className="py-2 hover:text-orange-300 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {/* Authentication Links */}
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="py-2 hover:text-orange-300 transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="py-2 hover:text-orange-300 transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* Removed username display on mobile */}
                <button 
                  onClick={logout}
                  className="py-2 text-left hover:text-orange-300 transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar