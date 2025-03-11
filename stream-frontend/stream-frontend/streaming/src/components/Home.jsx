import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

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
    } catch (err) {
      setError(err.message);
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format duration in seconds to MM:SS format
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return 'Unknown';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredVideos = videos.filter(video => 
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.videoId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className='flex flex-col items-center space-y-5 justify-center py-10'>
        <h1 className='text-5xl font-extrabold text-gray-700 dark:text-gray-100'>Welcome to Video Streaming Application</h1>
      </div>
      
      <div className="container mx-auto px-4 mb-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600 dark:text-gray-300">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">
            {error}
            <button 
              onClick={fetchVideos}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery ? "No videos match your search" : "No videos available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Link 
                to={`/video/${video.videoId}`} 
                key={video.videoId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-1">
                    {video.title || 'Untitled Video'}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">ID: {video.videoId}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Home