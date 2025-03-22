import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {API_URL} from '../../Constants';


function VideoUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [meta, setMeta] = useState({ title: "", description: "" });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Create a ref for the file input
  const fileInputRef = useRef(null);
  
  // Get authenticated user from context
  const { getUser } = useAuth();
  const user = getUser();
  const token = user ? user.accessToken : null;
  
  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      checkVideoDimensions(file);
    }
  }

  function checkVideoDimensions(file) {
    // Create a temporary URL for the video file
    const videoURL = URL.createObjectURL(file);
    const video = document.createElement('video');
    
    video.onloadedmetadata = function() {
      // Revoke the URL to free up memory
      URL.revokeObjectURL(videoURL);
      
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      setDimensions({ width, height });
      
      // Check if it's a vertical video (height > width)
      if (height > width) {
        setMessage('Vertical videos are not supported. Please upload a video with landscape orientation.');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      } else {
        setMessage('');
      }
    };
    
    // Handle errors in loading the video
    video.onerror = function() {
      URL.revokeObjectURL(videoURL);
      setMessage('Could not check video dimensions. Please ensure this is a valid video file.');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    };
    
    video.src = videoURL;
  }

  function formFieldChange(event) {
    const { name, value } = event.target;
    setMeta((prevMeta) => ({
      ...prevMeta,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }
    
    // Double-check that it's not a vertical video before uploading
    if (dimensions.height > dimensions.width) {
      setMessage('Vertical videos are not supported. Please upload a video with landscape orientation.');
      return;
    }
    
    console.log(meta);
    uploadFile();
  }

  async function uploadFile() {
    setUploading(true);
    try {
      let formData = new FormData();
      formData.append('title', meta.title);
      formData.append('description', meta.description);
      formData.append('file', selectedFile);

      await axios.post(`${API_URL}/api/v1/videos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add the JWT token if available
          'Authorization': token ? `Bearer ${token}` : ''
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(progress);
          if(progress === 100){
            setMessage('Processing Video, Please wait...')
          }
        },
      });
      setMessage('File uploaded successfully');
      setProgress(0);
      setMeta({ title: "", description: "" });
      setSelectedFile(null);
      setDimensions({ width: 0, height: 0 });
      // Clear the file input's value using the ref
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      setMessage('Failed to upload file');
    }
    setUploading(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-lg bg-black p-6 shadow-lg border border-blue-600">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Upload Video</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-blue-300 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Enter video title"
              value={meta.title}
              onChange={formFieldChange}
              className="w-full p-3 bg-gray-900 border border-blue-500 rounded-md text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-blue-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter video description"
              value={meta.description}
              onChange={formFieldChange}
              className="w-full p-3 bg-gray-900 border border-blue-500 rounded-md text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              rows="3"
              required
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="fileUpload" className="block text-sm font-medium text-blue-300 mb-1">
              Select Video File (Landscape orientation only)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-blue-500 rounded-md bg-gray-900">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-4 py-2">
                    <span>Select a file</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file"
                      accept="video/*"
                      className="sr-only" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      required
                    />
                  </label>
                  <p className="pl-1 pt-2">{selectedFile ? selectedFile.name : "No file chosen"}</p>
                </div>
                <p className="text-xs text-gray-400">
                  MP4, MOV, AVI up to 2GB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {selectedFile && dimensions.width > 0 && (
          <div className="mt-2 text-center text-sm text-blue-300">
            Video dimensions: {dimensions.width} x {dimensions.height} px
            {dimensions.width > dimensions.height ? (
              <span className="ml-2 text-green-400">(Landscape orientation ✓)</span>
            ) : (
              <span className="ml-2 text-red-400">(Vertical orientation ✗)</span>
            )}
          </div>
        )}
        
        {uploading && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {message && (
          <div 
            className={`mt-2 text-center p-2 rounded ${
              message.includes('success') ? 'bg-blue-900 text-blue-200' : message.includes('Vertical') ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-blue-300'
            }`}
            onClick={() => setMessage('')}
          >
            {message}
          </div>
        )}
        
        <button
          disabled={uploading || (selectedFile && dimensions.height > dimensions.width)}
          type="submit"
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ease-in-out"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}

export default VideoUpload;