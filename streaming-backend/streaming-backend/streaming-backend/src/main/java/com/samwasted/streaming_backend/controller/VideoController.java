package com.samwasted.streaming_backend.controller;

import com.samwasted.streaming_backend.entities.Video;
import com.samwasted.streaming_backend.playload.CustomMessage;
import com.samwasted.streaming_backend.services.AppConstants;
import com.samwasted.streaming_backend.services.VideoDurationService;
import com.samwasted.streaming_backend.services.VideoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@RestController
@RequestMapping("api/v1/videos")
@CrossOrigin(origins = "http://localhost:5173")
public class VideoController {

    private final VideoService videoService;
    private final VideoDurationService durationService;

    public VideoController(VideoService videoService, VideoDurationService durationService) {
        this.videoService = videoService;
        this.durationService = durationService;
    }

    // For uploading videos
    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description
    ){
        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setVideoId(UUID.randomUUID().toString());

        Video savedVideo = videoService.save(video, file);
        if(savedVideo != null) {
            return ResponseEntity.status(HttpStatus.OK).body(video);

        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(CustomMessage.builder()
                    .message("Video not uploaded")
                    .success(false)
                    .build()
            );
        }
    }

    // Get all videos with duration
    @GetMapping
    public List<Video> getAll(){
        List<Video> videos = videoService.getAll();

        // Calculate and set duration for each video if not already available
        return videos.stream().map(video -> {
            if (video.getDuration() == null) {
                // Try to get duration using FFprobe
                Double duration = durationService.getVideoDuration(video.getVideoId());

                // If FFprobe fails, try the M3U8 parsing method as fallback
                if (duration == null) {
                    duration = durationService.getDurationFromM3U8(video.getVideoId());
                }

                if (duration != null) {
                    video.setDuration(duration);
                    videoService.updateVideo(video); // Assuming you have a method to update the video
                }
            }
            return video;
        }).collect(Collectors.toList());
    }

    // Get video duration by ID
    @GetMapping("/{videoId}/duration")
    public ResponseEntity<?> getVideoDuration(@PathVariable String videoId) {
        Video video = videoService.get(videoId);

        if (video == null) {
            return ResponseEntity.notFound().build();
        }

        // If duration is already available in the database, return it
        if (video.getDuration() != null) {
            return ResponseEntity.ok().body(
                    CustomMessage.builder()
                            .message("Video duration fetched successfully")
                            .success(true)
                            .data(video.getDuration())
                            .build()
            );
        }

        // Try to calculate duration
        Double duration = durationService.getVideoDuration(videoId);

        if (duration == null) {
            // Try alternative method if FFprobe failed
            duration = durationService.getDurationFromM3U8(videoId);
        }

        if (duration != null) {
            // Update video with the calculated duration
            video.setDuration(duration);
            videoService.updateVideo(video); // Assuming you have a method to update the video

            return ResponseEntity.ok().body(
                    CustomMessage.builder()
                            .message("Video duration calculated successfully")
                            .success(true)
                            .data(duration)
                            .build()
            );
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    CustomMessage.builder()
                            .message("Could not determine video duration")
                            .success(false)
                            .build()
            );
        }
    }

    // --- All the existing methods remain the same ---

    //for streaming videos
//    @GetMapping("/stream/{videoId}")
//    public ResponseEntity<Resource> stream(@PathVariable String videoId){ // also not using this
//        Video video = videoService.get(videoId);
//
//        String contentType = video.getContentType();
//        String filePath = video.getFilePath();
//
//        Resource resource = new FileSystemResource(filePath);
//
//        if(contentType==null){
//            contentType = "application/octet-stream";
//        }
//        return ResponseEntity
//                .ok()
//                .contentType(MediaType.parseMediaType(contentType))
//                .body(resource);
//    }
//
//    //stream in chunks
//    @GetMapping("/stream/range/{videoId}")
//    public ResponseEntity<Resource> streamRange( // not using this method Now
//            @PathVariable String videoId,
//            @RequestHeader(value = "Range", required = false) String range ) throws IOException {
//        System.out.println(range);
//
//        Video video = videoService.get(videoId);
//        Path path = Paths.get(video.getFilePath());
//
//        Resource resource = new FileSystemResource(path);
//
//        String contentType = video.getContentType();
//        if(contentType==null){
//            contentType = "application/octet-stream";
//        }
//        //file length
//        long fileLength = path.toFile().length();
//
//        if(range == null){
//            return ResponseEntity.ok()
//                    .contentType(MediaType.parseMediaType(contentType))
//                    .body(resource); //pehle jaisa unedited bhejdia
//        }
//        long rangeStart;
//        long rangeEnd;
//
//        String[] ranges = range.replace("bytes=", "").split("-");
//        rangeStart = Long.parseLong(ranges[0]);
//        rangeEnd = rangeStart + AppConstants.CHUNK_SIZE-1;
//        if(rangeEnd > fileLength-1){
//            rangeEnd = fileLength-1;
//        }
//
//        InputStream inputStream;
//
//        try{
//            inputStream = new FileInputStream(path.toFile());
//            inputStream.skip(rangeStart);
//        } catch(IOException ex){
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//        long contentLength = rangeEnd - rangeStart + 1;
//
//        byte[] data = new byte[(int)contentLength];
//        int read = inputStream.read(data,0, data.length);
//        System.out.println("read(number of bytes) : "+ read);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.add("Content-Range", "bytes "+rangeStart+"-"+rangeEnd+"/"+fileLength);
//        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
//        headers.add("Pragma", "no-cache");
//        headers.add("Expires", "0");
//        headers.add("X-Content-Type-Options", "nosniff"); //for security purposes
//        headers.setContentLength(contentLength);
//
//        return ResponseEntity
//                .status(HttpStatus.PARTIAL_CONTENT)
//                .headers(headers)
//                .contentType(MediaType.parseMediaType(contentType))
//                .body(new ByteArrayResource(data));
//    }
    //serve hls playlist

    //master.m2u8 file

    @Value("${file.video.hsl}")
    private String HLS_DIR;

    @GetMapping("/{videoId}/master.m3u8")
    public ResponseEntity<Resource> serverMasterFile(
            @PathVariable String videoId
    ) {
        // Create path for master playlist
        Path path = Paths.get(HLS_DIR, videoId, "master.m3u8");

        System.out.println(path);

        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Resource resource = new FileSystemResource(path);

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.CONTENT_TYPE, "application/vnd.apple.mpegurl"
                )
                .body(resource);
    }

    // Serve the variant playlists
    @GetMapping("/{videoId}/{variant}/playlist.m3u8")
    public ResponseEntity<Resource> serveVariantPlaylist(
            @PathVariable String videoId,
            @PathVariable String variant
    ) {
        // Create path for variant playlist
        Path path = Paths.get(HLS_DIR, videoId, variant, "playlist.m3u8");

        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Resource resource = new FileSystemResource(path);

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.CONTENT_TYPE, "application/vnd.apple.mpegurl"
                )
                .body(resource);
    }

    // Serve the segments
    @GetMapping("/{videoId}/{variant}/segment_{segment}.ts")
    public ResponseEntity<Resource> serveSegments(
            @PathVariable String videoId,
            @PathVariable String variant,
            @PathVariable String segment
    ) {
        // Create path for segment in specific variant folder
        Path path = Paths.get(HLS_DIR, videoId, variant, "segment_" + segment + ".ts");

        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Resource resource = new FileSystemResource(path);

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.CONTENT_TYPE, "video/mp2t"
                )
                .body(resource);
    }
    // Add this method to the VideoController class

    @Value("${file.thumbnail.dir}")
    private String THUMBNAIL_DIR;


    @GetMapping("/{videoId}/thumbnail")
    public ResponseEntity<?> getThumbnail(@PathVariable String videoId) {
        Video video = videoService.get(videoId);

        if (video == null) {
            return ResponseEntity.notFound().build();
        }

        // Define standard thumbnail path based on videoId
        String thumbnailFilename = videoId + ".jpg";
        Path standardThumbnailPath = Paths.get(THUMBNAIL_DIR, thumbnailFilename);
        Path thumbnailPath;
        boolean thumbnailExists = false;

        // First check if the thumbnail exists at the stored path
        if (video.getThumbnailPath() != null) {
            thumbnailPath = Paths.get(video.getThumbnailPath());
            thumbnailExists = Files.exists(thumbnailPath);

            // If the stored path doesn't exist, check the standard path
            if (!thumbnailExists) {
                thumbnailPath = standardThumbnailPath;
                thumbnailExists = Files.exists(thumbnailPath);

                // If found at standard path, update the entity
                if (thumbnailExists) {
                    video.setThumbnailPath(thumbnailPath.toString());
                    videoService.updateVideo(video);
                }
            }
        } else {
            // No stored path, check standard location
            thumbnailPath = standardThumbnailPath;
            thumbnailExists = Files.exists(thumbnailPath);
        }

        // If thumbnail doesn't exist anywhere, generate it synchronously
        if (!thumbnailExists) {
            ResponseEntity<?> generationResult = generateThumbnail(videoId);

            // If generation failed, return the error
            if (generationResult.getStatusCode() != HttpStatus.OK) {
                return generationResult;
            }

            // Retrieve the updated video entity with the thumbnail path
            video = videoService.get(videoId);

            // Use the correct thumbnail path
            if (video.getThumbnailPath() != null) {
                thumbnailPath = Paths.get(video.getThumbnailPath());
            } else {
                thumbnailPath = standardThumbnailPath;
            }

            // Double-check the thumbnail file exists
            if (!Files.exists(thumbnailPath)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(CustomMessage.builder()
                                .message("Thumbnail generation reported success but file not found")
                                .success(false)
                                .data(null)
                                .fileName(null)
                                .build());
            }
        }

        // Serve the thumbnail
        try {
            Resource resource = new FileSystemResource(thumbnailPath);
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CustomMessage.builder()
                            .message("Error serving thumbnail: " + e.getMessage())
                            .success(false)
                            .data(null)
                            .fileName(null)
                            .build());
        }
    }

    /**
     * Generates a thumbnail from the video at the 3-second mark.
     * @param videoId The ID of the video.
     * @return ResponseEntity with generation result.
     */
    private ResponseEntity<?> generateThumbnail(String videoId) {
        Video video = videoService.get(videoId);

        if (video == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Video not found")
                            .success(false)
                            .data(null)
                            .fileName(null)
                            .build()
            );
        }

        try {
            // Create thumbnail directory if it doesn't exist
            Path thumbnailDir = Paths.get(THUMBNAIL_DIR);
            if (!Files.exists(thumbnailDir)) {
                Files.createDirectories(thumbnailDir);
            }

            // Define thumbnail path and filename
            String thumbnailFilename = videoId + ".jpg";
            Path thumbnailPath = Paths.get(THUMBNAIL_DIR, thumbnailFilename);

            // Build FFmpeg command to extract frame at 3 seconds
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "ffmpeg",
                    "-i", Paths.get(HLS_DIR, videoId, "master.m3u8").toString(),
                    "-ss", "00:00:03",
                    "-vframes", "1",
                    "-q:v", "2",
                    thumbnailPath.toString()
            );

            // Redirect output and error streams to avoid blocking issues
            processBuilder.redirectErrorStream(true);
            processBuilder.redirectOutput(ProcessBuilder.Redirect.INHERIT);

            // Execute the FFmpeg command and wait for it to finish
            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        CustomMessage.builder()
                                .message("Failed to generate thumbnail. FFmpeg exit code: " + exitCode)
                                .success(false)
                                .data(null)
                                .fileName(null)
                                .build()
                );
            }

            // Update video entity with the thumbnail path
            video.setThumbnailPath(thumbnailPath.toString());
            videoService.updateVideo(video);

            return ResponseEntity.status(HttpStatus.OK).body(
                    CustomMessage.builder()
                            .message("Thumbnail generated successfully")
                            .success(true)
                            .data(null)
                            .fileName(thumbnailPath.toString())
                            .build()
            );
        } catch (IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    CustomMessage.builder()
                            .message("Error generating thumbnail: " + e.getMessage())
                            .success(false)
                            .data(null)
                            .fileName(null)
                            .build()
            );
        }
    }

    @PostMapping("/{videoId}/thumbnail")
    public ResponseEntity<?> requestThumbnailGeneration(@PathVariable String videoId) {
        return generateThumbnail(videoId);
    }
    @DeleteMapping("/{videoId}")
    public ResponseEntity<?> deleteVideo(@PathVariable String videoId) {
        Video video = videoService.get(videoId);

        if (video == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    CustomMessage.builder()
                            .message("Video not found")
                            .success(false)
                            .build()
            );
        }

        try {
            // Delete HLS files
            Path hlsDirectory = Paths.get(HLS_DIR, videoId);
            if (Files.exists(hlsDirectory)) {
                Files.walk(hlsDirectory)
                        .sorted(java.util.Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                System.err.println("Error deleting file: " + path + " - " + e.getMessage());
                            }
                        });
            }

            // Delete thumbnail if exists
            if (video.getThumbnailPath() != null) {
                Path thumbnailPath = Paths.get(video.getThumbnailPath());
                if (Files.exists(thumbnailPath)) {
                    Files.delete(thumbnailPath);
                }
            }

            // Delete from database
            boolean deleted = videoService.delete(videoId);

            if (deleted) {
                return ResponseEntity.status(HttpStatus.OK).body(
                        CustomMessage.builder()
                                .message("Video deleted successfully")
                                .success(true)
                                .build()
                );
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        CustomMessage.builder()
                                .message("Failed to delete video record from database")
                                .success(false)
                                .build()
                );
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    CustomMessage.builder()
                            .message("Error deleting video files: " + e.getMessage())
                            .success(false)
                            .build()
            );
        }
    }
}