import { useState, useEffect } from 'react'
import VideoPlayer from './VideoPlayer';

function Home() {
  const [vidID, setVidID] = useState("")
  const [fieldValue, setFieldValue] = useState("")
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch videos when component mounts
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/videos');
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      setVideos(data);
      
      // Auto-select the first video if available
      if (data.length > 0 && !vidID) {
        setVidID(data[0].videoId);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const playVideo = (id) => {
    setVidID(id);
  };

  return (
    <>
      <div className='flex flex-col items-center space-y-5 justify-center py-10'>
        <h1 className='text-5xl font-extrabold text-gray-700 dark:text-gray-100'>Welcome to Video Streaming Application</h1>
        
      </div>
      
      <div className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Available Videos</h2>
            
            {loading ? (
              <p className="text-gray-600 dark:text-gray-300">Loading videos...</p>
            ) : error ? (
              <div className="text-red-500">
                {error}
                <button 
                  onClick={fetchVideos}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : videos.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No videos available</p>
            ) : (
              <ul className="space-y-2">
                {videos.map((video) => (
                  <li key={video.videoId} className="border-b pb-2 last:border-b-0">
                    <button
                      onClick={() => playVideo(video.videoId)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        vidID === video.videoId 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{video.title || 'Untitled Video'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">ID: {video.videoId}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-md font-semibold mb-2 text-blue-300">Play by ID</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter video id here"
                  name="video_id_field"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="p-2 border rounded w-full text-amber-50"
                />
                <button
                  onClick={() => playVideo(fieldValue)}
                  className="px-4 py-2 bg-violet-600 text-white font-semibold rounded hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-600 whitespace-nowrap"
                >
                  Play
                </button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
  {vidID ? (
    <VideoPlayer key={vidID}
      src={`http://localhost:8080/api/v1/videos/${vidID}/master.m3u8`} 
      description={videos.find(v => v.videoId === vidID)?.description || "No description available for this video."}
    />
  ) : (
    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">Select a video to play</p>
    </div>
  )}
</div>
        
        </div>
      </div>
    </>
  )
}

export default Home