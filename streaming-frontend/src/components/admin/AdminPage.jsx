import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminTab from './AdminTab'
import { orderApi } from '../misc/OrderApi'
import { handleLogError } from '../misc/Helpers'

function AdminPage() {
  const Auth = useAuth()
  const user = Auth.getUser()

  const [users, setUsers] = useState([])
  const [userUsernameSearch, setUserUsernameSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(true)
  const [isUsersLoading, setIsUsersLoading] = useState(false)
 
  useEffect(() => {
    if (user && user.data && user.data.rol) {
      setIsAdmin(user.data.rol[0] === 'ADMIN')
    }
    handleGetUsers()
  }, [])

  // Fixed handleInputChange to work with standard React events
  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'userUsernameSearch') {
      setUserUsernameSearch(value)
    }
  }

  const handleGetUsers = async () => {
    setIsUsersLoading(true)
    try {
      const response = await orderApi.getUsers(user)
      setUsers(response.data)
    } catch (error) {
      handleLogError(error)
    } finally {
      setIsUsersLoading(false)
    }
  }

  const handleDeleteUser = async (username) => {
    try {
      await orderApi.deleteUser(user, username)
      handleGetUsers()
    } catch (error) {
      handleLogError(error)
    }
  }

  const handleSearchUser = async () => {
    // Trim the search term to avoid empty space searches
    const username = userUsernameSearch.trim()
    
    // If search is empty, get all users instead
    if (!username) {
      handleGetUsers()
      return
    }
    
    setIsUsersLoading(true)
    try {
      const response = await orderApi.getUsers(user, username)
      const data = response.data
      const users = data instanceof Array ? data : [data]
      setUsers(users)
    } catch (error) {
      handleLogError(error)
      setUsers([])
    } finally {
      setIsUsersLoading(false)
    }
  }

  // Add ability to handle search on enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchUser()
    }
  }

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    handleSearchUser()
  }

  if (!isAdmin) {
    return <Navigate to='/' />
  }

  return (
    <div className="container mx-auto p-4">
      <AdminTab
        isUsersLoading={isUsersLoading}
        users={users}
        userUsernameSearch={userUsernameSearch}
        handleDeleteUser={handleDeleteUser}
        handleSearchUser={handleSearchUser}
        handleSearchSubmit={handleSearchSubmit}
        handleKeyPress={handleKeyPress}
        handleInputChange={handleInputChange}
      />
    </div>
  )
}

export default AdminPage