package com.samwasted.streaming_backend.services;

import com.samwasted.streaming_backend.entities.Playlist;
import com.samwasted.streaming_backend.entities.Video;
import com.samwasted.streaming_backend.repositories.PlaylistRepository;
import com.samwasted.streaming_backend.repositories.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final VideoRepository videoRepository;

    @Autowired
    public PlaylistService(PlaylistRepository playlistRepository, VideoRepository videoRepository) {
        this.playlistRepository = playlistRepository;
        this.videoRepository = videoRepository;
    }

    // Get all playlists
    public List<Playlist> getAllPlaylists() {
        return playlistRepository.findAll();
    }

    // Get a specific playlist by ID
    public Playlist getPlaylist(String playlistId) {
        return playlistRepository.findById(playlistId).orElse(null);
    }

    // Create a new playlist
    public Playlist createPlaylist(Playlist playlist) {
        if (playlist.getPlaylistId() == null) {
            playlist.setPlaylistId(UUID.randomUUID().toString());
        }
        
        Date now = new Date();
        playlist.setCreatedAt(now);
        playlist.setUpdatedAt(now);
        
        return playlistRepository.save(playlist);
    }

    // Update a playlist
    public Playlist updatePlaylist(Playlist playlist) {
        Optional<Playlist> existingPlaylist = playlistRepository.findById(playlist.getPlaylistId());
        
        if (existingPlaylist.isPresent()) {
            playlist.setUpdatedAt(new Date());
            return playlistRepository.save(playlist);
        }
        
        return null;
    }

    // Delete a playlist
    public boolean deletePlaylist(String playlistId) {
        Optional<Playlist> playlist = playlistRepository.findById(playlistId);
        
        if (playlist.isPresent()) {
            playlistRepository.deleteById(playlistId);
            return true;
        }
        
        return false;
    }

    // Add a video to a playlist
    @Transactional
    public Playlist addVideoToPlaylist(String playlistId, String videoId) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(playlistId);
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        
        if (playlistOpt.isPresent() && videoOpt.isPresent()) {
            Playlist playlist = playlistOpt.get();
            Video video = videoOpt.get();
            
            // Check if video is already in playlist
            if (!playlist.getVideos().contains(video)) {
                playlist.getVideos().add(video);
                playlist.setUpdatedAt(new Date());
                return playlistRepository.save(playlist);
            }
            
            return playlist;
        }
        
        return null;
    }

    // Remove a video from a playlist
    @Transactional
    public Playlist removeVideoFromPlaylist(String playlistId, String videoId) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(playlistId);
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        
        if (playlistOpt.isPresent() && videoOpt.isPresent()) {
            Playlist playlist = playlistOpt.get();
            Video video = videoOpt.get();
            
            if (playlist.getVideos().remove(video)) {
                playlist.setUpdatedAt(new Date());
                return playlistRepository.save(playlist);
            }
            
            return playlist;
        }
        
        return null;
    }

    // Find all playlists containing a specific video
    public List<Playlist> getPlaylistsContainingVideo(String videoId) {
        return playlistRepository.findByVideos_VideoId(videoId);
    }
}