package com.samwasted.streaming_backend.services.impl;

import com.samwasted.streaming_backend.entities.Video;
import com.samwasted.streaming_backend.repositories.VideoRepository;
import com.samwasted.streaming_backend.services.VideoService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.util.List;

@Service
public class VideoServiceImpl implements VideoService {

    @Value("${files.video}")
    String DIR;

    @Value("${file.video.hsl}")
    String HSL_DIR;
    private VideoRepository videoRepository;

    public VideoServiceImpl(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }
    @PostConstruct
    public void init() {
        File file = new File(DIR);

        try {
            Files.createDirectories(Paths.get(HSL_DIR));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


        if (!file.exists()) {
            file.mkdir();
            System.out.println("Folder created");
        }
        else{
            System.out.println("Folder already exists");
        }
    }
    @Override
    public Video save(Video video, MultipartFile file) {
        try {
            //original filename from system
            String filename = file.getOriginalFilename();
            String contentType = file.getContentType();
            InputStream inputStream = file.getInputStream();


            String cleanFileName = StringUtils.cleanPath(filename);
            String cleanFolderName = StringUtils.cleanPath(DIR);

            Path path = Paths.get(cleanFolderName, cleanFileName);
            System.out.println(contentType);
            System.out.println(path);
            //create folder path, with filename and copy it to folder
            Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);
            // metadata

            video.setContentType(contentType);
            video.setFilePath(path.toString());

           try {
               videoRepository.save(video);
               processVideo(video.getVideoId());
               //save
               // also delete actual video file and database entry
               return video;
           } catch (Exception e) {
               //delete code here
               throw new RuntimeException(e);
           }

        } catch(IOException e){
                e.printStackTrace();
                return null;
        }

    }

    @Override
    public Video get(String videoId) {
        Video video =  videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));
        return video;
    }

    @Override
    public Video getByTitle(String title) {
        return null;
    }

    @Override
    public List<Video> getAll() {
        return videoRepository.findAll();
    }
    public String processVideo(String videoId) {
        Video video = this.get(videoId);
        String filePath = video.getFilePath();

        // Path where to store data:
        Path videoPath = Paths.get(filePath);

        // Main output directory
        Path outputPath = Paths.get(HSL_DIR, videoId);

        try {
            // Create main directory
            Files.createDirectories(outputPath);

            // Create directories for each resolution variant
            // FFmpeg will use these as output directories (0, 1, 2)
            Files.createDirectories(Paths.get(HSL_DIR, videoId, "0"));
            Files.createDirectories(Paths.get(HSL_DIR, videoId, "1"));
            Files.createDirectories(Paths.get(HSL_DIR, videoId, "2"));

            // Build ffmpeg command for multiple resolutions
            StringBuilder ffmpegCmd = new StringBuilder();
            ffmpegCmd.append("ffmpeg -i \"")
                    .append(videoPath.toString())
                    .append("\" -c:v libx264 -c:a aac")
                    .append(" ")
                    .append("-map 0:v -map 0:a -s:v:0 640x360 -b:v:0 800k ")
                    .append("-map 0:v -map 0:a -s:v:1 1280x720 -b:v:1 2800k ")
                    .append("-map 0:v -map 0:a -s:v:2 1920x1080 -b:v:2 5000k ")
                    .append("-var_stream_map \"v:0,a:0 v:1,a:1 v:2,a:2\" ")
                    .append("-master_pl_name master.m3u8 ")
                    .append("-f hls -hls_time 10 -hls_list_size 0 ")
                    .append("-hls_segment_filename \"")
                    .append(HSL_DIR)
                    .append(videoId)
                    .append("/%v/segment_%03d.ts\" ")
                    .append("\"")
                    .append(HSL_DIR)
                    .append(videoId)
                    .append("/%v/playlist.m3u8\"");

            String ffmpegCommand = ffmpegCmd.toString();
            System.out.println(ffmpegCommand);

            // Execute ffmpeg command
            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", ffmpegCommand);
            processBuilder.inheritIO();
            Process process = processBuilder.start();
            int exit = process.waitFor();
            if (exit != 0) {
                throw new RuntimeException("Video processing failed!!");
            }

            return videoId;

        } catch (IOException ex) {
            throw new RuntimeException("Video processing failed!!", ex);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Video processing interrupted", e);
        }
    }
    public Video delete(Video video) {
        if(video == null) {
            throw new IllegalArgumentException("Video must not be null");
        }
        videoRepository.delete(video);
        return video;
    }
}
