import React from 'react'
import VideoPlayer from './components/VideoPlayer'
import Home from './components/Home'
import { Route, Routes } from 'react-router-dom'
import VideoUpload from './components/VideoUpload'
import Navbar from './components/Navbar'
import VideoPlayerPage from './components/VideoPlayerPage'
import PlaylistManager from './components/PlaylistManager'

function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/video/:id" element={<VideoPlayerPage />} />
      <Route path="/upload" element={<VideoUpload />} />
      <Route path="/playlists" element={<PlaylistManager />} />
    </Routes>
    </>
  )
}

export default App