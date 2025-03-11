import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Hls from "hls.js";
import "video.js/dist/video-js.css";
import { useParams, Link } from "react-router-dom";

function VideoPlayerPage() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simplified fetch handling
    const fetchVideoData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/videos");
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const allVideos = await response.json();
        const foundVideo = allVideos.find(video => video.videoId === id || video.id === id);
        
        if (!foundVideo) {
          throw new Error(`Video not found`);
        }
        
        setVideoData(foundVideo);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchVideoData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && !error && videoRef.current && videoData) {
      // Initialize video player
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "auto",
        responsive: true,
        fluid: true,
      });

      const videoSrc = `http://localhost:8080/api/v1/videos/${id}/master.m3u8`;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
        });
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = videoSrc;
        videoRef.current.addEventListener("canplay", () => {
          videoRef.current.play();
        });
      }

      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    }
  }, [id, loading, error, videoData]);

  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-4">
          <Link to="/" className="text-blue-500 hover:underline flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Videos
          </Link>
        </div>
        <div className="text-red-500 text-center p-4">
          {error}
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm ml-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Videos
        </Link>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {videoData?.title || 'Untitled Video'}
      </h1>
      
      <div className="video-player-container mb-6">
        <div className="video-container w-full h-auto aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
          <div data-vjs-player className="w-full h-full">
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered"
            ></video>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
        <div 
          className="p-4 cursor-pointer flex justify-between items-center border-b border-gray-200 dark:border-gray-700"
          onClick={toggleDescription}
        >
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">Description</h3>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-96 p-4' : 'max-h-0'}`}>
          <p className="text-gray-700 dark:text-gray-300">
            {videoData?.description || "No description available for this video."}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
        <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-2">Video Details</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span className="font-medium">ID:</span> {videoData?.videoId || id}
        </p>
        {videoData?.uploadDate && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Uploaded:</span> {new Date(videoData.uploadDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default VideoPlayerPage;