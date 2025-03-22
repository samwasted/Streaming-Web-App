package com.samwasted.streaming_backend.services;

import com.samwasted.streaming_backend.entities.Video;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VideoService {
    Video save(Video video, MultipartFile file);
    Video delete(Video video);
    Video get(String videoId);

    Video getByTitle(String title);

    List<Video> getAll();

    //video processing
    String processVideo(String videoId);

    Video updateVideo(Video video);

    boolean delete(String videoId);
}
