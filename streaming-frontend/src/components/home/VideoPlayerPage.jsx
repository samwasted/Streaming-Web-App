import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Hls from "hls.js";
import "video.js/dist/video-js.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {API_URL} from '../../Constants';
function VideoPlayerPage() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hlsRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentResolution, setCurrentResolution] = useState("auto");
  const [availableResolutions, setAvailableResolutions] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(16/9); // Default aspect ratio
  const navigate = useNavigate();
  const Auth = useAuth();

  // Determine if the current user is an admin.
  const currentUser = Auth.getUser();
  const isAdmin =
    currentUser &&
    currentUser.data &&
    currentUser.data.rol &&
    currentUser.data.rol[0] === "ADMIN";
  
  // Check if current user is the owner of the video
  const isOwner = 
  currentUser && 
  videoData && 
  currentUser.data && 
  videoData.username && 
  currentUser.data.preferred_username === videoData.username;
  
  // User can delete if they are the owner or an admin
  const canDelete = isAdmin || isOwner;

  // Helper function to get relative time string
  const getRelativeTimeString = (dateString) => {
    const now = new Date();
    const uploadDate = new Date(dateString);
    const diffMs = now - uploadDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    }
  };

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/videos`);
        if (!response.ok) throw new Error('Failed to fetch videos');
        
        const allVideos = await response.json();
        const foundVideo = allVideos.find(
          (video) => video.videoId === id || video.id === id
        );
        if (!foundVideo) throw new Error('Video not found');

        setVideoData(foundVideo);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) fetchVideoData();
  }, [id, API_URL]);

  // Initialize video player and HLS with slight delay
  useEffect(() => {
    // Clear existing player references
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Only initialize if we have everything we need
    if (!loading && !error && videoRef.current && videoData) {
      let mounted = true;
      
      const initializePlayer = () => {
        if (!mounted) return;
        
        // Initialize video.js player with responsive option
        playerRef.current = videojs(videoRef.current, {
          controls: true,
          preload: "auto",
          responsive: true,
          fluid: true,
          muted: false,
          controlBar: {
            children: [
              'playToggle',
              'volumePanel',
              'currentTimeDisplay',
              'timeDivider',
              'durationDisplay',
              'progressControl',
              'liveDisplay',
              'customControlSpacer',
              'fullscreenToggle',
            ]
          }
        });

        // Apply custom colors to video.js player
        const playerEl = document.querySelector('.video-js');
        if (playerEl) {
          playerEl.classList.add('vjs-custom-theme');
        }

        const videoSrc = `${API_URL}/api/v1/videos/${id}/master.m3u8`;

        if (Hls.isSupported()) {
          hlsRef.current = new Hls();
          hlsRef.current.loadSource(videoSrc);
          hlsRef.current.attachMedia(videoRef.current);

          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (!mounted) return;
            
            // Set available resolutions
            const resOptions = [{ label: "Auto", value: "auto" }];
            data.levels.forEach((level, index) => {
              resOptions.push({ label: `${level.height}p`, value: index.toString() });
              
              // Use the first level to determine aspect ratio
              if (index === 0 && level.width && level.height) {
                const videoAspectRatio = level.width / level.height;
                setAspectRatio(videoAspectRatio);
              }
            });
            setAvailableResolutions(resOptions);
          });
          
          // Handle HLS errors
          hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("HLS network error", data);
                  hlsRef.current.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("HLS media error", data);
                  hlsRef.current.recoverMediaError();
                  break;
                default:
                  console.error("Fatal HLS error", data);
                  if (mounted) {
                    setError("Failed to load video stream. Please try again later.");
                  }
                  break;
              }
            }
          });
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = videoSrc;
        } else {
          if (mounted) {
            setError("Your browser doesn't support HLS video playback.");
          }
        }
      };

      const timer = setTimeout(() => {
        initializePlayer();
      }, 100);

      return () => {
        mounted = false;
        clearTimeout(timer);
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }
  }, [loading, error, videoData, id, API_URL]);

  // Set up metadata and aspect ratio detection from video
  useEffect(() => {
    if (videoRef.current && playerRef.current) {
      const player = playerRef.current;
      
      // Function to update aspect ratio when metadata is loaded
      const handleMetadataLoaded = () => {
        if (videoRef.current) {
          const videoElement = videoRef.current;
          if (videoElement.videoWidth && videoElement.videoHeight) {
            const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            setAspectRatio(videoAspectRatio);
          }
        }
      };
      
      player.on('loadedmetadata', handleMetadataLoaded);
      
      return () => {
        player.off('loadedmetadata', handleMetadataLoaded);
      };
    }
  }, [playerRef.current, videoRef.current]);

  // Update HLS quality level
  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel =
        currentResolution === "auto" 
          ? -1 
          : parseInt(currentResolution);
    }
  }, [currentResolution]);

  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  const handleDeleteVideo = async () => {
    // JWT Authentication Check
    const user = Auth.getUser();
    if (!user || !user.accessToken) {
      setError("You must be logged in to delete videos.");
      navigate('/login');
      return;
    }
    
    // Confirm before deleting
    const confirmed = window.confirm("Are you sure you want to delete this video? This action cannot be undone.");
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/videos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete video');
      }
      
      navigate('/');
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
      setDeleting(false);
    }
  };

  // External resolution selector handler
  const handleResolutionChange = (e) => {
    const newResolution = e.target.value;
    setCurrentResolution(newResolution);
    
    if (hlsRef.current) {
      hlsRef.current.currentLevel = newResolution === "auto" ? -1 : parseInt(newResolution);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-4">
            <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Videos
            </Link>
          </div>
          <div className="text-center p-6 bg-gray-900 border border-red-600 rounded-lg">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate padding-top based on aspect ratio for responsive container
  const paddingTopPercentage = (1 / aspectRatio) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Videos
          </Link>
          
          {/* Delete button is visible only to admin users or the video owner */}
          {canDelete && (
            <button 
              onClick={handleDeleteVideo}
              disabled={deleting}
              className="px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-700 hover:bg-red-600 text-white"
            >
              {deleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Video
                </>
              )}
            </button>
          )}
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-blue-400">
          {videoData?.title || 'Untitled Video'}
        </h1>
        
        {/* Video player container with dynamic aspect ratio */}
        <div className="video-player-container mb-4">
          <div 
            className="responsive-video-container w-full relative bg-black rounded-lg overflow-hidden shadow-lg border border-blue-900"
            style={{ paddingTop: `${paddingTopPercentage}%` }}
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div data-vjs-player className="w-full h-full">
                <video
                  ref={videoRef}
                  className="video-js vjs-big-play-centered vjs-custom-theme"
                ></video>
              </div>
            </div>
          </div>
        </div>
        
        {/* Display current aspect ratio */}
        <div className="mb-2 text-sm text-gray-400">
          Video aspect ratio: {aspectRatio.toFixed(2)}:1
        </div>
        
        {/* User and upload info */}
        <div className="mb-4 flex items-center">
          <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-xl font-bold mr-3">
            {videoData?.username ? videoData.username.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-blue-300 font-medium">
              {videoData?.username ? `Uploaded by ${videoData.username}` : 'Unknown uploader'}
            </p>
            {videoData?.uploadTime && (
              <p className="text-gray-500 text-sm">
                {getRelativeTimeString(videoData.uploadTime)}
              </p>
            )}
          </div>
        </div>
        
        {/* External resolution selector */}
        {availableResolutions.length > 0 && (
          <div className="mb-6 flex justify-end">
            <div className="relative inline-block text-left">
              <select
                value={currentResolution}
                onChange={handleResolutionChange}
                className="appearance-none bg-gray-900 border border-blue-600 text-blue-100 py-1 px-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableResolutions.map(res => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-900 border border-blue-800 rounded-lg overflow-hidden mb-8 shadow-md">
          <div 
            className="p-4 cursor-pointer flex justify-between items-center border-b border-blue-900"
            onClick={toggleDescription}
          >
            <h3 className="font-medium text-lg text-blue-300">Description</h3>
            <svg 
              className={`w-5 h-5 text-blue-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-96 p-4' : 'max-h-0'}`}>
            <p className="text-gray-300 mb-2">
              {videoData?.description || "No description available for this video."}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-blue-800 rounded-lg p-4 shadow-md">
          <h3 className="font-medium text-lg text-blue-300 mb-2">Video Details</h3>
          <p className="text-sm text-gray-400 mb-1">
            <span className="font-medium text-blue-400">ID:</span> {videoData?.videoId || id}
          </p>
          {videoData?.uploadTime && (
            <p className="text-sm text-gray-400">
              <span className="font-medium text-blue-400">Uploaded:</span> {new Date(videoData.uploadTime).toLocaleString()}
            </p>
          )}
        </div>
        
        {/* CSS for video.js custom theme */}
        <style>{`
          /* Custom styling for video.js */
          .vjs-custom-theme {
            --vjs-primary-color: #3b82f6; /* blue-500 */
            --vjs-secondary-color: #1e3a8a; /* blue-900 */
          }
          
          .vjs-custom-theme .vjs-big-play-button {
            background-color: var(--vjs-primary-color) !important;
            border-color: var(--vjs-primary-color) !important;
          }
          
          .vjs-custom-theme .vjs-control-bar {
            background-color: var(--vjs-secondary-color) !important;
          }
          
          .vjs-custom-theme .vjs-slider-bar,
          .vjs-custom-theme .vjs-volume-level,
          .vjs-custom-theme .vjs-play-progress {
            background-color: var(--vjs-primary-color) !important;
          }
          
          /* Ensure the video fills the container properly */
          .video-js {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
          
          /* Responsive container with dynamic padding-top approach */
          .responsive-video-container {
            transition: padding-top 0.3s ease;
          }
        `}</style>
      </div>
    </div>
  );
}

export default VideoPlayerPage;