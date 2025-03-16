import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link 
            to="./" 
            className="text-white hover:bg-gray-700 px-3 py-2 rounded-md font-medium"
          >
            Home
          </Link>
          <Link 
            to="./upload" 
            className="text-white hover:bg-gray-700 px-3 py-2 rounded-md font-medium"
          >
            Upload
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;