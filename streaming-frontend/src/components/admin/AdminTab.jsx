import React from 'react'
import UserTable from './UserTable'

function AdminTab(props) {
  const {
    handleInputChange,
    isUsersLoading,
    users,
    userUsernameSearch,
    handleDeleteUser,
    handleSearchUser,
  } = props

  // Wrapper function to confirm deletion before proceeding
  const handleDeleteUserConfirm = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      handleDeleteUser(userId)
    }
  }

  return (
    <div className="w-full">
      <div className="p-4">
        {isUsersLoading ? (
          <div className="text-center text-gray-400">Loading Users...</div>
        ) : (
          <UserTable
            users={users}
            userUsernameSearch={userUsernameSearch}
            handleInputChange={handleInputChange}
            handleDeleteUser={handleDeleteUserConfirm}
            handleSearchUser={handleSearchUser}
          />
        )}
      </div>
    </div>
  )
}

export default AdminTab
