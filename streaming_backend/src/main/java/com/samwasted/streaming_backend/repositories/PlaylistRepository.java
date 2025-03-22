package com.samwasted.streaming_backend.repositories;

import com.samwasted.streaming_backend.entities.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {
    // Find all playlists containing a specific video
    List<Playlist> findByVideos_VideoId(String videoId);
}