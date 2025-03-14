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
    <div className="min-h-screen  text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6 mb-10">
          <h1 className="text-4xl font-bold text-blue-400">Video Streaming</h1>
          
          <div className="w-full max-w-2xl relative">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-900 border border-blue-500 rounded-md text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-gray-900 rounded-lg border border-red-500">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchVideos}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center p-12 bg-gray-900 rounded-lg border border-blue-500">
            <p className="text-blue-300">
              {searchQuery ? "No videos match your search" : "No videos available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Link 
                to={`/video/${video.videoId}`} 
                key={video.videoId}
                className="bg-gray-900 rounded-lg overflow-hidden border border-blue-800 hover:border-blue-400 transition-all transform hover:-translate-y-1"
              >
                <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                  {/* Thumbnail Image */}
                  <img 
                    src={`http://localhost:8080/api/v1/videos/${video.videoId}/thumbnail`}
                    alt={video.title || 'Video thumbnail'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if thumbnail fails to load
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                      const svg = document.createElement('svg');
                      svg.className = 'w-16 h-16 text-blue-400';
                      svg.setAttribute('fill', 'none');
                      svg.setAttribute('viewBox', '0 0 24 24');
                      svg.setAttribute('stroke', 'currentColor');
                      svg.innerHTML = `
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      `;
                      e.target.parentNode.appendChild(svg);
                    }}
                  />
                  
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 bg-blue-900 bg-opacity-90 text-blue-100 text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-blue-300 mb-2 line-clamp-1">
                    {video.title || 'Untitled Video'}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-blue-500 truncate">ID: {video.videoId}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home