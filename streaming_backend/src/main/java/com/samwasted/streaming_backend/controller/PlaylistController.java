package com.samwasted.streaming_backend.controller;

import com.samwasted.streaming_backend.entities.Playlist;
import com.samwasted.streaming_backend.playload.CustomMessage;
import com.samwasted.streaming_backend.services.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;

    @Autowired
    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    // Get all playlists
    @GetMapping
    public ResponseEntity<List<Playlist>> getAllPlaylists() {
        List<Playlist> playlists = playlistService.getAllPlaylists();
        return ResponseEntity.ok(playlists);
    }

    // Get a specific playlist
    @GetMapping("/{playlistId}")
    public ResponseEntity<?> getPlaylist(@PathVariable String playlistId) {
        Playlist playlist = playlistService.getPlaylist(playlistId);
        
        if (playlist == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Playlist not found")
                            .success(false)
                            .build()
            );
        }
        
        return ResponseEntity.ok(playlist);
    }

    // Create a new playlist
    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestBody Playlist playlist) {
        // Extract username from authentication context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        playlist.setUsername(username);
        
        Playlist createdPlaylist = playlistService.createPlaylist(playlist);

        if (createdPlaylist != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlaylist);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    CustomMessage.builder()
                            .message("Failed to create playlist")
                            .success(false)
                            .build()
            );
        }
    }

    // Update playlist details
    @PutMapping("/{playlistId}")
    public ResponseEntity<?> updatePlaylist(
            @PathVariable String playlistId,
            @RequestBody Playlist updatedPlaylist
    ) {
        // First, check ownership or admin role
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        
        // Get the existing playlist to check ownership
        Playlist existingPlaylist = playlistService.getPlaylist(playlistId);
        if (existingPlaylist == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Playlist not found")
                            .success(false)
                            .build()
            );
        }
        
        // Check if user is authorized to modify this playlist
        if (!currentUsername.equals(existingPlaylist.getUsername()) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    CustomMessage.builder()
                            .message("You don't have permission to update this playlist")
                            .success(false)
                            .build()
            );
        }
        
        // Ensure the path ID matches the body ID and preserve the original owner
        updatedPlaylist.setPlaylistId(playlistId);
        updatedPlaylist.setUsername(existingPlaylist.getUsername()); // Prevent ownership change
        
        Playlist result = playlistService.updatePlaylist(updatedPlaylist);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    CustomMessage.builder()
                            .message("Failed to update playlist")
                            .success(false)
                            .build()
            );
        }
    }

    // Delete a playlist
    @DeleteMapping("/{playlistId}")
    public ResponseEntity<?> deletePlaylist(@PathVariable String playlistId) {
        // First, check ownership or admin role
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        
        // Get the existing playlist to check ownership
        Playlist existingPlaylist = playlistService.getPlaylist(playlistId);
        if (existingPlaylist == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Playlist not found")
                            .success(false)
                            .build()
            );
        }
        
        // Check if user is authorized to delete this playlist
        if (!currentUsername.equals(existingPlaylist.getUsername()) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    CustomMessage.builder()
                            .message("You don't have permission to delete this playlist")
                            .success(false)
                            .build()
            );
        }
        
        boolean deleted = playlistService.deletePlaylist(playlistId);
        
        if (deleted) {
            return ResponseEntity.ok(
                    CustomMessage.builder()
                            .message("Playlist deleted successfully")
                            .success(true)
                            .build()
            );
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    CustomMessage.builder()
                            .message("Failed to delete playlist")
                            .success(false)
                            .build()
            );
        }
    }

    // Add a video to a playlist
    @PostMapping("/{playlistId}/videos")
    public ResponseEntity<?> addVideoToPlaylist(
            @PathVariable String playlistId,
            @RequestBody Map<String, String> payload
    ) {
        // First, check ownership or admin role
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        
        // Get the existing playlist to check ownership
        Playlist existingPlaylist = playlistService.getPlaylist(playlistId);
        if (existingPlaylist == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Playlist not found")
                            .success(false)
                            .build()
            );
        }
        
        // Check if user is authorized to modify this playlist
        if (!currentUsername.equals(existingPlaylist.getUsername()) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    CustomMessage.builder()
                            .message("You don't have permission to modify this playlist")
                            .success(false)
                            .build()
            );
        }
        
        String videoId = payload.get("videoId");
        
        if (videoId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    CustomMessage.builder()
                            .message("Video ID is required")
                            .success(false)
                            .build()
            );
        }
        
        Playlist updatedPlaylist = playlistService.addVideoToPlaylist(playlistId, videoId);
        
        if (updatedPlaylist != null) {
            return ResponseEntity.ok(
                    CustomMessage.builder()
                            .message("Video added to playlist successfully")
                            .success(true)
                            .data(updatedPlaylist)
                            .build()
            );
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Playlist or video not found")
                            .success(false)
                            .build()
            );
        }
    }

    // Remove a video from a playlist
    @DeleteMapping("/{playlistId}/videos/{videoId}")
    public ResponseEntity<?> removeVideoFromPlaylist(
            @PathVariable String playlistId,
            @PathVariable String videoId
    ) {
        // First, check ownership or admin role
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        
        // Get the existing playlist to check ownership
        Playlist existingPlaylist = playlistService.getPlaylist(playlistId);
        if (existingPlaylist == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Playlist not found")
                            .success(false)
                            .build()
            );
        }
        
        // Check if user is authorized to modify this playlist
        if (!currentUsername.equals(existingPlaylist.getUsername()) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    CustomMessage.builder()
                            .message("You don't have permission to modify this playlist")
                            .success(false)
                            .build()
            );
        }
        
        Playlist updatedPlaylist = playlistService.removeVideoFromPlaylist(playlistId, videoId);
        
        if (updatedPlaylist != null) {
            return ResponseEntity.ok(
                    CustomMessage.builder()
                            .message("Video removed from playlist successfully")
                            .success(true)
                            .data(updatedPlaylist)
                            .build()
            );
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Playlist or video not found")
                            .success(false)
                            .build()
            );
        }
    }

    // Get all playlists containing a specific video
    @GetMapping("/by-video/{videoId}")
    public ResponseEntity<List<Playlist>> getPlaylistsByVideo(@PathVariable String videoId) {
        List<Playlist> playlists = playlistService.getPlaylistsContainingVideo(videoId);
        return ResponseEntity.ok(playlists);
    }
}