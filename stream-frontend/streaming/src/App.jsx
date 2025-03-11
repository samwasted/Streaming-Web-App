import React from 'react'
import VideoPlayer from './components/VideoPlayer'
import Home from './components/Home'
import { Route, Routes } from 'react-router-dom'
import VideoUpload from './components/VideoUpload'
import Navbar from './components/Navbar'
function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<VideoUpload />} />
    </Routes>
    </>
  )
}

export default App