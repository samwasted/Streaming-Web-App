# Video Streaming Web App

## Overview
This is a **video streaming web application** built using **Spring Boot** for the backend and **React (Vite)** for the frontend. The app supports **video uploading, HLS-based streaming with adjustable quality, playlists, JWT authentication, and role-based access control**.

## Features
- **Video Uploading** (Only for authenticated users)
- **HLS Adaptive Streaming** (quality adjustment using FFmpeg)
- **Video Playlists** (Users can create and manage playlists)
- **User Authentication** (JWT-based authentication & authorization)
- **User Dashboard** (Displays uploaded videos and playlists)
- **Public Video Streaming** (Users can watch videos and playlists without logging in)
- **Admin Role** (Admins can delete users and videos)
- **Responsive Video Player** (React + HLS.js)
- **Backend: Spring Boot + MySQL**
- **Frontend: React (Vite)**

## Tech Stack
### Frontend
- React.js (Vite)
- HLS.js (for streaming)
- React Router (for navigation)
- Tailwind CSS (for styling)

### Backend
- Spring Boot
- MySQL (database)
- FFmpeg (for video processing & HLS conversion)
- JWT Authentication (for user authentication and authorization)

## User Roles
- **Regular Users**
  - Can watch videos and playlists without logging in
  - Must log in to upload videos and create playlists
  - Can manage their own videos and playlists

- **Admin Users**
  - Can delete any user
  - Can delete any video
  - Have full control over content moderation
