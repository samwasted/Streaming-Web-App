import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { getUser, userIsAuthenticated, userLogout } = useAuth()

  const logout = () => {
    userLogout()
  }

  const isAuthenticated = userIsAuthenticated()
  const user = getUser()
  const userName = user ? user.data.name : ''

  const isAdmin = user && user.data.rol[0] === 'ADMIN'
  const isUser = user && user.data.rol[0] === 'USER'

  return (
    <nav className="bg-orange-950 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          <span className="font-bold text-xl transition-transform duration-300 hover:scale-110 cursor-pointer">SV</span>
          <Link to="/" className="relative py-1 overflow-hidden group">
            <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">Home</span>
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
              <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">UserPage</span>
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
              <Link to="/upload" className="relative py-1 overflow-hidden group">
                <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-300">Upload</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <span className="font-medium transition-transform duration-300 hover:scale-105">{`Hi ${userName}`}</span>
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
    </nav>
  )
}

export default Navbar