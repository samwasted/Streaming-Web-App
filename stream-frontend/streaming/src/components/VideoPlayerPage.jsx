import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Hls from "hls.js";
import "video.js/dist/video-js.css";
import { useParams, Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/videos");
        if (!response.ok) throw new Error('Failed to fetch videos');
        
        const allVideos = await response.json();
        const foundVideo = allVideos.find(video => video.videoId === id || video.id === id);
        if (!foundVideo) throw new Error('Video not found');

        setVideoData(foundVideo);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) fetchVideoData();
  }, [id]);

  // Initialize video player and HLS
  useEffect(() => {
    if (!loading && !error && videoRef.current && videoData) {
      const initializePlayer = () => {
        playerRef.current = videojs(videoRef.current, {
          controls: true,
          preload: "auto",
          responsive: true,
          fluid: true,
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

        const videoSrc = `http://localhost:8080/api/v1/videos/${id}/master.m3u8`;

        if (Hls.isSupported()) {
          hlsRef.current = new Hls();
          hlsRef.current.loadSource(videoSrc);
          hlsRef.current.attachMedia(videoRef.current);

          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            const resOptions = [{ label: "Auto", value: "auto" }];
            data.levels.forEach((level, index) => {
              resOptions.push({ label: `${level.height}p`, value: index.toString() });
            });
            setAvailableResolutions(resOptions);
            videoRef.current.play();
          });
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = videoSrc;
          videoRef.current.addEventListener("canplay", () => videoRef.current.play());
        }
      };

      initializePlayer();

      return () => {
        if (playerRef.current) playerRef.current.dispose();
        if (hlsRef.current) hlsRef.current.destroy();
      };
    }
  }, [loading, error, videoData]);

  // Update HLS quality level
  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = currentResolution === "auto" 
        ? -1 
        : parseInt(currentResolution);
    }
  }, [currentResolution]);

  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  const handleDeleteVideo = async () => {
    // Confirm before deleting
    const confirmed = window.confirm("Are you sure you want to delete this video? This action cannot be undone.");
    
    if (!confirmed) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/videos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete video');
      }
      
      // Redirect to home page after successful deletion
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
          
          <button 
            onClick={handleDeleteVideo}
            disabled={deleting}
            className="px-4 py-2 bg-gray-800 hover:bg-grey-500 text-white rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-blue-400">
          {videoData?.title || 'Untitled Video'}
        </h1>
        
        <div className="video-player-container mb-4">
          <div className="video-container w-full h-auto aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-blue-900">
            <div data-vjs-player className="w-full h-full">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-custom-theme"
              ></video>
            </div>
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
            <p className="text-gray-300">
              {videoData?.description || "No description available for this video."}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-blue-800 rounded-lg p-4 shadow-md">
          <h3 className="font-medium text-lg text-blue-300 mb-2">Video Details</h3>
          <p className="text-sm text-gray-400 mb-1">
            <span className="font-medium text-blue-400">ID:</span> {videoData?.videoId || id}
          </p>
          {videoData?.uploadDate && (
            <p className="text-sm text-gray-400">
              <span className="font-medium text-blue-400">Uploaded:</span> {new Date(videoData.uploadDate).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {/* CSS for video.js custom theme */}
        <style jsx>{`
          /* Custom styling for video.js */
          :global(.vjs-custom-theme) {
            --vjs-primary-color: #3b82f6; /* blue-500 */
            --vjs-secondary-color: #1e3a8a; /* blue-900 */
          }
          
          :global(.vjs-custom-theme .vjs-big-play-button) {
            background-color: var(--vjs-primary-color) !important;
            border-color: var(--vjs-primary-color) !important;
          }
          
          :global(.vjs-custom-theme .vjs-control-bar) {
            background-color: var(--vjs-secondary-color) !important;
          }
          
          :global(.vjs-custom-theme .vjs-slider-bar),
          :global(.vjs-custom-theme .vjs-volume-level),
          :global(.vjs-custom-theme .vjs-play-progress) {
            background-color: var(--vjs-primary-color) !important;
          }
        `}</style>
      </div>
    </div>
  );
}

export default VideoPlayerPage;