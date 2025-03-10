import React, { useState, useRef } from 'react';
import axios from 'axios';

function VideoUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [meta, setMeta] = useState({ title: "", description: "" });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Create a ref for the file input
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
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

      await axios.post('http://localhost:8080/api/v1/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(progress);
        },
      });
      setMessage('File uploaded successfully');
      setProgress(0);
      setMeta({ title: "", description: "" });
      setSelectedFile(null);
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
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-100 dark:bg-gray-500 rounded-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <input
          type="text"
          name="title"
          placeholder="Enter title"
          value={meta.title}
          onChange={formFieldChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Enter description"
          value={meta.description}
          onChange={formFieldChange}
          className="p-2 border rounded"
          required
        />
        <input
          onChange={handleFileChange}
          type="file"
          ref={fileInputRef}
          className="file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-600 dark:file:text-violet-100 dark:hover:file:bg-violet-500"
          required
        />
        <button
          disabled={uploading}
          type="submit"
          className="px-6 py-2 bg-violet-600 text-white font-semibold rounded hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          Upload
        </button>
        <div
          hidden={!uploading}
          style={{
            width: "100%",
            backgroundColor: "#e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: "#3b82f6",
              height: "20px",
            }}
          />
        </div>
        <div
          className="text-purple-700 dark:text-purple-300"
          onClick={() => setMessage('')}
        >
          {message}
        </div>
      </form>
    </div>
  );
}

export default VideoUpload;
