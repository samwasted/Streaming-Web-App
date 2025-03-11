import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Hls from "hls.js";
import "video.js/dist/video-js.css";

function VideoPlayer({ src, description = "No description available." }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // For initialization
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      preload: "auto",
      responsive: true,
      fluid: true,
    });

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
      videoRef.current.addEventListener("canplay", () => {
        videoRef.current.play();
      });
    } else {
      console.log("video format not supported");
    }

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [src]);

  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="video-player-container">
      <div className="video-container w-full h-auto aspect-video">
        <div data-vjs-player className="w-full h-full">
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
          ></video>
        </div>
      </div>
      
      <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
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
          <p className="text-gray-700 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;