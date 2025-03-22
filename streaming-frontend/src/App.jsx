import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/context/AuthContext'
import PrivateRoute from './components/misc/PrivateRoute'
import Navbar from './components/misc/Navbar'
import Home from './components/home/Home'
import Login from './components/home/Login'
import Signup from './components/home/Signup'
import AdminPage from './components/admin/AdminPage'
import UserPage from './components/user/UserPage'
import VideoPlayerPage from './components/home/VideoPlayerPage'
import VideoUpload from './components/home/VideoUpload'
import PlaylistManager from './components/home/PlaylistManager'
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path="/adminpage" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
          <Route path="/userpage" element={<PrivateRoute><UserPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/video/:id" element={<VideoPlayerPage />} />
          <Route path="/playlist" element={<PlaylistManager />} />
         <Route path="/upload" element={<PrivateRoute><VideoUpload /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
