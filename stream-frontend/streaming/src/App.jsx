import { useState } from 'react'
import VideoUpload from './components/VideoUpload'
import './App.css'
import VideoPlayer from './components/VideoPlayer'

function App() {
 
  const [vidID, setVidID] = useState("8082f30c-d740-4f71-9cd7-3ffc8e101f3d")
  const [fieldValue, setFieldValue] = useState(null)
  const playVideo = (id) => {
    setVidID(id);
  };
  return (
    <>
     <div className='flex flex-col items-center space-y-5 justify-center py-10'>
      <h1 className='text-5xl font-extrabold text-gray-700 dark:text-gray-100'>Welcome to Video Streaming Application</h1>
      <VideoUpload />
     </div>
     <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter video id here"
            name="video_id_field"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={() => playVideo(fieldValue)}
            className="px-4 py-2 bg-violet-600 text-white font-semibold rounded hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            Play
          </button>
        </div></div>
      <div>
        <VideoPlayer src={`http://localhost:8080/api/v1/videos/${vidID}/master.m3u8`}/>
      </div>
     
    </>
  )
}

export default App
