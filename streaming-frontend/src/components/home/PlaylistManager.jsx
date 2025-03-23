import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {API_URL} from '../../Constants';



// Playlist Card Component
const PlaylistCard = ({ playlist, onView, onEdit, onDelete, isAuthenticated }) => {
  console.log(playlist)
  const Auth = useAuth()
  const currentUser = Auth.getUser();
  const isAdmin =
    currentUser &&
    currentUser.data &&
    currentUser.data.rol &&
    currentUser.data.rol[0] === "ADMIN";
  
  // Check if current user is the owner of the playlist
  const isOwner = 
  currentUser && 
  playlist && 
  currentUser.data && 
  playlist.username && 
  currentUser.data.preferred_username === playlist.username;
  
  // User can delete if they are the owner or an admin
  const canDelete = isAdmin || isOwner; //is case mein also edit


  const thumbnail = playlist.videos && playlist.videos.length > 0
    ? `${API_URL}/api/v1/videos/${playlist.videos[0].videoId}/thumbnail`
    : "";

  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-blue-800 hover:border-blue-500 transition-all shadow-lg">
      <div className="relative aspect-video">
        <img 
          src={thumbnail} 
          alt= "No Videos added"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
          {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-blue-300 text-lg mb-1">{playlist.name}</h3>
        <p className="text-blue-500 text-sm h-10 overflow-hidden">
          {playlist.description || "No description"}
        </p>
        {/* Added creator username */}
        <p className="text-blue-400 text-xs mt-1">
          Created by: {playlist.username || "Unknown user"}
        </p>
        <div className="flex justify-between mt-3">
          <button 
            onClick={() => onView(playlist)} 
            className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-3 rounded text-sm transition-colors"
          >
            View
          </button>
          {canDelete && isAuthenticated && (
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit(playlist)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(playlist.playlistId)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Playlist Modal
const CreatePlaylistModal = ({ onClose, onCreate, loading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Playlist name is required');
      return;
    }
    onCreate({ name, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
      <div className="bg-gray-900 p-6 rounded-lg border border-blue-800 max-w-lg w-full">
        <h2 className="text-xl font-semibold text-blue-400 mb-4">Create New Playlist</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-500 text-white px-4 py-2 rounded mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <input
          type="text"
          placeholder="Playlist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 bg-gray-800 border border-blue-600 rounded text-white"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 border border-blue-600 rounded text-white"
          rows="3"
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors flex-1 disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Playlist'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Prompt Modal
const LoginPromptModal = ({ onClose }) => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
      <div className="bg-gray-900 p-6 rounded-lg border border-blue-800 max-w-lg w-full">
        <h2 className="text-xl font-semibold text-blue-400 mb-4">Authentication Required</h2>
        <p className="text-blue-300 mb-6">You need to be logged in to perform this action.</p>
        <div className="flex space-x-2">
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors flex-1"
          >
            Log In
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
function PlaylistManager() {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'detail'
  const [searchQuery, setSearchQuery] = useState('');
  
  const Auth = useAuth()
  const currentUser = Auth.getUser();
  const isAdmin =
    currentUser &&
    currentUser.data &&
    currentUser.data.rol &&
    currentUser.data.rol[0] === "ADMIN";
  
  // Check if current user is the owner of the playlist
  const isOwner = 
  currentUser && 
  currentPlaylist && 
  currentUser.data && 
  currentPlaylist.username && 
  currentUser.data.preferred_username === currentPlaylist.username;
  
  // User can delete if they are the owner or an admin
  const canDelete = isAdmin || isOwner; //is case mein also edit


  const { videoId } = useParams();
  const navigate = useNavigate();
  
  // Get authentication context - FIXED: Get both functions at the top level
  const { userIsAuthenticated, getUser } = useAuth();
  const isAuthenticated = userIsAuthenticated();

  // Fetch all playlists when component mounts
  useEffect(() => {
    fetchPlaylists();
    fetchAvailableVideos();
  }, []);

  // Fetch all playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/playlists`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      
      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available videos for adding to playlist
  const fetchAvailableVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/videos`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      setAvailableVideos(data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  // Authentication check wrapper function
  const requireAuth = (callback) => {
    if (isAuthenticated) {
      return callback();
    } else {
      setShowLoginPrompt(true);
    }
  };

  // Create a new playlist
  const createPlaylist = async (playlistData) => {
    requireAuth(async () => {
      try {
        setLoading(true);
        // FIXED: Use getUser() from the top-level destructuring
        const user = getUser();
        const token = user ? user.accessToken : null;
        
        const response = await fetch(`${API_URL}/api/v1/playlists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            ...playlistData,
            videos: []
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create playlist');
        }
        
        const data = await response.json();
        setPlaylists([...playlists, data]);
        setShowCreatePlaylistModal(false);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error creating playlist:', err);
      } finally {
        setLoading(false);
      }
    });
  };

  // Update a playlist
  const updatePlaylist = async () => {
    requireAuth(async () => {
      if (!currentPlaylist || !currentPlaylist.name.trim()) {
        setError('Playlist name is required');
        return;
      }
      
      try {
        setLoading(true);
        // FIXED: Use getUser() from the top-level destructuring
        const user = getUser();
        const token = user ? user.accessToken : null;
        
        const response = await fetch(`${API_URL}/api/v1/playlists/${currentPlaylist.playlistId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(currentPlaylist),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update playlist');
        }
        
        const updatedPlaylist = await response.json();
        setPlaylists(playlists.map(p => p.playlistId === updatedPlaylist.playlistId ? updatedPlaylist : p));
        setCurrentPlaylist(updatedPlaylist);
        console.log(currentPlaylist)
        setIsEditing(false);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error updating playlist:', err);
      } finally {
        setLoading(false);
      }
    });
  };
  
  // Delete a playlist
  const deletePlaylist = async (playlistId) => {
    requireAuth(async () => {
      if (!window.confirm('Are you sure you want to delete this playlist?')) {
        return;
      }
      
      try {
        setLoading(true);
        // FIXED: Use getUser() from the top-level destructuring
        const user = getUser();
        const token = user ? user.accessToken : null;
        
        const response = await fetch(`${API_URL}/api/v1/playlists/${playlistId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete playlist');
        }
        
        setPlaylists(playlists.filter(p => p.playlistId !== playlistId));
        if (currentPlaylist && currentPlaylist.playlistId === playlistId) {
          setCurrentPlaylist(null);
          setViewMode('grid');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error deleting playlist:', err);
      } finally {
        setLoading(false);
      }
    });
  };
  
  // Add video to playlist
  const addVideoToPlaylist = async () => {
    requireAuth(async () => {
      if (!currentPlaylist || !selectedVideoId) {
        setError('Please select a playlist and a video');
        return;
      }
      
      try {
        setLoading(true);
        // FIXED: Use getUser() from the top-level destructuring
        const user = getUser();
        const token = user ? user.accessToken : null;
        
        const response = await fetch(`${API_URL}/api/v1/playlists/${currentPlaylist.playlistId}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ videoId: selectedVideoId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add video to playlist');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setCurrentPlaylist(result.data);
          setPlaylists(playlists.map(p => p.playlistId === result.data.playlistId ? result.data : p));
          setShowAddVideoModal(false);
          setSelectedVideoId('');
        } else {
          throw new Error(result.message || 'Failed to add video');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error adding video to playlist:', err);
      } finally {
        setLoading(false);
      }
    });
  };
  
  // Remove video from playlist
  const removeVideoFromPlaylist = async (videoId) => {
    requireAuth(async () => {
      if (!currentPlaylist) return;
      
      try {
        setLoading(true);
        // FIXED: Use getUser() from the top-level destructuring
        const user = getUser();
        const token = user ? user.accessToken : null;
        
        const response = await fetch(`${API_URL}/api/v1/playlists/${currentPlaylist.playlistId}/videos/${videoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove video from playlist');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setCurrentPlaylist(result.data);
          setPlaylists(playlists.map(p => p.playlistId === result.data.playlistId ? result.data : p));
        } else {
          throw new Error(result.message || 'Failed to remove video');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error removing video from playlist:', err);
      } finally {
        setLoading(false);
      }
    });
  };

  // Handle clicking "Create Playlist" button
  const handleCreatePlaylistClick = () => {
    if (isAuthenticated) {
      setShowCreatePlaylistModal(true);
    } else {
      setShowLoginPrompt(true);
    }
  };

  // View playlist details
  const viewPlaylistDetails = (playlist) => {
    setCurrentPlaylist(playlist);
    setIsEditing(false);
    setViewMode('detail');
  };

  // Edit playlist
  const editPlaylist = (playlist) => {
    requireAuth(() => {
      setCurrentPlaylist({...playlist});
      setIsEditing(true);
      setViewMode('detail');
    });
  };

  // Format of the duration
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return 'Unknown';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Modified the getFilteredAvailableVideos function to include search filtering:
  const getFilteredAvailableVideos = () => {
    if (!currentPlaylist) return availableVideos;
    
    const currentVideoIds = currentPlaylist.videos.map(v => v.videoId);
    const filteredVideos = availableVideos.filter(v => !currentVideoIds.includes(v.videoId));
    
    // Apply search filter
    if (searchQuery) {
      return filteredVideos.filter(video => 
        video.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        video.videoId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredVideos;
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">Playlist Manager</h1>
          <div className="flex space-x-4">
            {viewMode === 'detail' && (
              <button
                onClick={() => setViewMode('grid')}
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors"
              >
                Back to All Playlists
              </button>
            )}
            <button
              onClick={handleCreatePlaylistClick}
              className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition-colors"
            >
              Create Playlist
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900 border border-red-500 text-white px-4 py-3 rounded mb-4 flex justify-between items-center">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="text-white hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}
        
        {viewMode === 'grid' ? (
          <div>
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">Playlists</h2>
            {loading && <p className="text-blue-300 text-center">Loading playlists...</p>}
            
            {!loading && playlists.length === 0 ? (
              <div className="bg-gray-900 p-8 rounded-lg border border-blue-800 text-center">
                <p className="text-blue-300 mb-4">No created playlists yet.</p>
                <button
                  onClick={handleCreatePlaylistClick}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors"
                >
                  Create First Playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.playlistId}
                    playlist={playlist}
                    onView={viewPlaylistDetails}
                    onEdit={editPlaylist}
                    onDelete={deletePlaylist}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {currentPlaylist && (
              <div className="bg-gray-900 p-6 rounded-lg border border-blue-800">
                { canDelete && isEditing ? (
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-400 mb-4">Edit Playlist</h2>
                    <input
                      type="text"
                      value={currentPlaylist.name}
                      onChange={(e) => setCurrentPlaylist({...currentPlaylist, name: e.target.value})}
                      className="w-full p-2 mb-3 bg-gray-800 border border-blue-600 rounded text-white"
                      placeholder="Playlist Name"
                    />
                    <textarea
                      value={currentPlaylist.description || ''}
                      onChange={(e) => setCurrentPlaylist({...currentPlaylist, description: e.target.value})}
                      className="w-full p-2 mb-4 bg-gray-800 border border-blue-600 rounded text-white"
                      placeholder="Description (optional)"
                      rows="3"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={updatePlaylist}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors flex-1 disabled:bg-blue-800 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) :  (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-blue-400">{currentPlaylist.name}</h2>
                      {canDelete && isAuthenticated && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePlaylist(currentPlaylist.playlistId)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div> 
                      )}
                    </div>
                    
                    {currentPlaylist.description && (
                      <p className="text-blue-300 mb-4">{currentPlaylist.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium text-blue-400">Videos ({currentPlaylist.videos.length})</h3>
                      {canDelete && isAuthenticated && (
                       <button
                         onClick={() => requireAuth(() => setShowAddVideoModal(true))}
                         className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-3 rounded text-sm transition-colors"
                         disabled={getFilteredAvailableVideos().length === 0}
                       >
                         Add Video
                       </button>
                      )}
                    </div>
                    
                    {currentPlaylist.videos.length === 0 ? (
                      <p className="text-blue-300 text-center py-4">No videos in this playlist.</p>
                    ) : (
                      <div className="space-y-4">
                        {currentPlaylist.videos.map((video, index) => (
                          <div key={video.videoId} className="flex bg-gray-800 border border-blue-900 rounded-lg overflow-hidden">
                            <div className="w-32 h-20 flex-shrink-0">
                              <img 
                               src={`${API_URL}/api/v1/videos/${video.videoId}/thumbnail` || "/api/placeholder/320/180"} 
                                alt={video.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3 flex-grow">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium text-blue-300">{video.title}</h4>
                                  <p className="text-sm text-blue-400">{formatDuration(video.duration)}</p>
                                </div>
                                <div className="flex space-x-2 items-start">
                                  <button
                                    onClick={() => navigate(`/video/${video.videoId}`)}
                                    className="text-blue-400 hover:text-blue-300 text-l"
                                  >
                                    Play
                                  </button>
                                  {canDelete && isAuthenticated && (
                                    <button
                                      onClick={() => removeVideoFromPlaylist(video.videoId)}
                                      className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
       {/* Add Video Modal */}
       {showAddVideoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
            <div className="bg-gray-900 p-6 rounded-lg border border-blue-800 max-w-4xl w-full">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Add Video to Playlist</h2>
              
              <div className="w-full relative mb-6">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-800 border border-blue-500 rounded-md text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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

              {getFilteredAvailableVideos().length === 0 ? (
                <p className="text-blue-300 mb-4">No videos available to add.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto mb-4">
                  {getFilteredAvailableVideos().map(video => (
                    <div 
                      key={video.videoId} 
                      className={`bg-gray-800 rounded-lg overflow-hidden border cursor-pointer transition-all ${selectedVideoId === video.videoId ? 'border-blue-400 ring-2 ring-blue-400' : 'border-blue-900 hover:border-blue-600'}`}
                      onClick={() => setSelectedVideoId(video.videoId)}
                    >
                      <div className="relative aspect-video bg-gray-800">
                        <img 
                          src={`${API_URL}/api/v1/videos/${video.videoId}/thumbnail`}
                          alt={video.title || 'Video thumbnail'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-blue-900 bg-opacity-90 text-blue-100 text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-blue-300 text-sm line-clamp-1">
                          {video.title || 'Untitled Video'}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={addVideoToPlaylist}
                  disabled={loading || !selectedVideoId}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors flex-1 disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Video'}
                </button>
                <button
                  onClick={() => {
                    setShowAddVideoModal(false);
                    setSelectedVideoId('');
                    setSearchQuery('');
                  }}
                  className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Create Playlist Modal */}
        {showCreatePlaylistModal && (
          <CreatePlaylistModal
            onClose={() => {
              setShowCreatePlaylistModal(false)
              setSearchQuery('')
            }}
            onCreate={createPlaylist}
            loading={loading}
          />
        )}
        
        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <LoginPromptModal
            onClose={() => setShowLoginPrompt(false)}
          />
        )}
      </div>
    </div>
  );
}

export default PlaylistManager;