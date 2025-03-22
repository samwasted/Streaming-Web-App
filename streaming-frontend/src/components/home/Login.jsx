import React, { useState } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderApi } from '../misc/OrderApi'
import { parseJwt, handleLogError } from '../misc/Helpers'

function Login() {
  const Auth = useAuth()
  const isLoggedIn = Auth.userIsAuthenticated()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isError, setIsError] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'username') {
      setUsername(value)
    } else if (name === 'password') {
      setPassword(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!(username && password)) {
      setIsError(true)
      return
    }
    try {
      const response = await orderApi.authenticate(username, password)
      const { accessToken } = response.data
      const data = parseJwt(accessToken)
      const authenticatedUser = { data, accessToken }

      Auth.userLogin(authenticatedUser)
      setUsername('')
      setPassword('')
      setIsError(false)
    } catch (error) {
      handleLogError(error)
      setIsError(true)
    }
  }

  if (isLoggedIn) {
    return <Navigate to={'/'} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded shadow">
        <h2 className="text-center text-2xl font-bold text-white">Login</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoFocus
                  placeholder="Username"
                  value={username}
                  onChange={handleInputChange}
                  className="appearance-none rounded-md relative block w-full pl-10 p-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 11V7a5 5 0 00-10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-md relative block w-full pl-10 p-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              Login
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <NavLink to="/signup" className="text-violet-500 hover:underline">
            Sign Up
          </NavLink>
        </div>
        {isError && (
          <div className="mt-4 p-3 bg-red-500 text-white rounded">
            The username or password provided are incorrect!
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
