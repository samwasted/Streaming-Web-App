import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserPage() {
  const { getUser } = useAuth();
  const user = getUser();
  const userName = user ? user.data.name : 'IACTUALLYDONTCAREABOUTYOURNAME';
  const username = user ? user.data.preferred_username : 'IDONTCAREYOUWILLNEVERSEEIT';
  
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("videos"); // "videos" or "playlists"
  
  // Use environment variable for API URL
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    // Fetch videos and playlists when component mounts
    if (username && username !== 'Guest') {
      fetchUserContent();
    } else {
      setLoading(false);
      setVideos([]);
      setPlaylists([]);
    }
  }, [username]);

  const fetchUserContent = async () => {
    try {
      setLoading(true);
      
      // Fetch videos and playlists concurrently
      const [videosResponse, playlistsResponse] = await Promise.all([
        fetch(`${API_URL}/api/v1/videos`),
        fetch(`${API_URL}/api/v1/playlists`)
      ]);
      
      if (!videosResponse.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      if (!playlistsResponse.ok) {
        throw new Error('Failed to fetch playlists');
      }
      
      const videosData = await videosResponse.json();
      const playlistsData = await playlistsResponse.json();
      
      // Filter videos by the current user's username
      const userVideos = videosData.filter(video => 
        video.username?.toLowerCase() === username.toLowerCase()
      );
      
      // Filter playlists by the current user's username
      const userPlaylists = playlistsData.filter(playlist => 
        playlist.username?.toLowerCase() === username.toLowerCase()
      );
      
      setVideos(userVideos);
      setPlaylists(userPlaylists);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user content:', err);
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

  const filteredPlaylists = playlists.filter(playlist => 
    playlist.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    playlist.playlistId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewPlaylist = (playlist) => {
    // Navigate to playlist page
    window.location.href = `/playlist/${playlist.playlistId}`;
  };

  const handleEditPlaylist = (playlist) => {
    // Navigate to edit playlist page
    window.location.href = `/edit-playlist/${playlist.playlistId}`;
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/v1/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if needed
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }
      
      // Remove the deleted playlist from state
      setPlaylists(playlists.filter(p => p.playlistId !== playlistId));
      
    } catch (err) {
      console.error('Error deleting playlist:', err);
      alert('Failed to delete playlist: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6 mb-10">
          <h1 className="text-4xl font-bold text-blue-400">Hello, {userName}</h1>
          <p className="text-lg text-blue-300">@{username}</p>
          
          {/* Added buttons for Upload and Create Playlist */}
          <div className="flex space-x-4">
            <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
              Upload New Video
            </Link>
            <Link to="/playlist" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
              Create Playlist
            </Link>
          </div>
          
          <div className="w-full max-w-2xl space-y-4">
            {/* Title/ID search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search your content by title..."
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
            
            {/* Tabs */}
            <div className="flex justify-center border-b border-blue-800">
              <button
                onClick={() => setActiveTab("videos")}
                className={`px-6 py-2 font-medium text-sm ${
                  activeTab === "videos" 
                    ? "text-blue-400 border-b-2 border-blue-400" 
                    : "text-blue-200 hover:text-blue-300"
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab("playlists")}
                className={`px-6 py-2 font-medium text-sm ${
                  activeTab === "playlists" 
                    ? "text-blue-400 border-b-2 border-blue-400" 
                    : "text-blue-200 hover:text-blue-300"
                }`}
              >
                Playlists
              </button>
            </div>
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
              onClick={fetchUserContent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : username === 'Guest' ? (
          <div className="text-center p-12 bg-gray-900 rounded-lg border border-blue-500">
            <p className="text-blue-300 mb-4">Please log in to view your content</p>
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
              Login
            </Link>
          </div>
        ) : activeTab === "videos" ? (
          <>
            {filteredVideos.length === 0 ? (
              <div className="text-center p-12 bg-gray-900 rounded-lg border border-blue-500">
                <p className="text-blue-300">
                  {searchQuery ? "No videos match your search" : "You haven't uploaded any videos yet"}
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
                        src={`${API_URL}/api/v1/videos/${video.videoId}/thumbnail`}
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
          </>
        ) : (
          <>
            {filteredPlaylists.length === 0 ? (
              <div className="text-center p-12 bg-gray-900 rounded-lg border border-blue-500">
                <p className="text-blue-300">
                  {searchQuery ? "No playlists match your search" : "You haven't created any playlists yet"}
                </p>
                <Link to="/create-playlist" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
                  Create Playlist
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaylists.map((playlist) => (
                  <div key={playlist.playlistId} className="bg-gray-900 rounded-lg overflow-hidden border border-blue-800 hover:border-blue-500 transition-all shadow-lg">
                    <div className="relative aspect-video">
                      <img 
                        src={playlist.videos && playlist.videos.length > 0
                          ? `${API_URL}/api/v1/videos/${playlist.videos[0].videoId}/thumbnail`
                          : ""
                        } 
                        alt="Playlist thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for empty playlist or failed thumbnail
                          e.target.onerror = null;
                          e.target.src = "";
                          e.target.alt = "No videos";
                          e.target.parentNode.classList.add('bg-gray-800', 'flex', 'items-center', 'justify-center');
                          
                          const placeholderText = document.createElement('div');
                          placeholderText.className = 'text-blue-400 text-center px-4';
                          placeholderText.textContent = 'No videos in playlist';
                          e.target.parentNode.appendChild(placeholderText);
                        }}
                      />
                      <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
                        {playlist.videos ? playlist.videos.length : 0} video{playlist.videos && playlist.videos.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-blue-300 text-lg mb-1">{playlist.name}</h3>
                      <p className="text-blue-500 text-sm h-10 overflow-hidden">
                        {playlist.description || "No description"}
                      </p>
                      <div className="flex justify-between mt-3">
                        <button 
                          onClick={() => handleViewPlaylist(playlist)} 
                          className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-3 rounded text-sm transition-colors"
                        >
                          View
                        </button>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditPlaylist(playlist)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePlaylist(playlist.playlistId)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserPage;