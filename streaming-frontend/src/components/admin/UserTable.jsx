import React from 'react';

function UserTable({ users, userUsernameSearch, handleInputChange, handleDeleteUser, handleSearchUser }) {
  let userList;
  
  if (users.length === 0) {
    userList = (
      <tr>
        <td colSpan="6" className="text-center py-4">No users found</td>
      </tr>
    );
  } else {
    userList = users.map(user => {
      return (
        <tr key={user.id} className="border-b text-amber-200">
          <td className="py-2 px-4">{user.id}</td>
          <td className="py-2 px-4">{user.username}</td>
          <td className="py-2 px-4">{user.name}</td>
          <td className="py-2 px-4">{user.email}</td>
          <td className="py-2 px-4">{user.role}</td>
          <td className="py-2 px-4">
            <button 
              onClick={() => handleDeleteUser(user.username)}
              className="bg-purple-900 hover:bg-purple-800 text-white font-bold py-1 px-2 rounded"
            >
              Delete
            </button>
          </td>
        </tr>
      );
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by username..."
          value={userUsernameSearch}
          onChange={handleInputChange}
          className="border p-2 rounded mr-2 flex-grow bg-[rgba(0,100,255,0.3)] text-amber-100"
        />
        <button
          onClick={handleSearchUser}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Search
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-blue-950 border">
          <thead className="bg-purple-700 text-amber-100">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default UserTable;