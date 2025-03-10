package com.samwasted.streaming_backend.controller;

import com.samwasted.streaming_backend.entities.Video;
import com.samwasted.streaming_backend.playload.CustomMessage;
import com.samwasted.streaming_backend.services.AppConstants;
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


@RestController
@RequestMapping("api/v1/videos")
@CrossOrigin("*")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }
    //for uploading videos
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

        }else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(CustomMessage.builder()
                    .message("Video not uploaded")
                    .success(false)
                    .build()
                    );
        }

    }
    // for all vids
    @GetMapping
    public List<Video> getAll(){
        return videoService.getAll();
    }
    //for streaming videos
    @GetMapping("/stream/{videoId}")
    public ResponseEntity<Resource> stream(@PathVariable String videoId){
        Video video = videoService.get(videoId);

        String contentType = video.getContentType();
        String filePath = video.getFilePath();

        Resource resource = new FileSystemResource(filePath);

        if(contentType==null){
            contentType = "application/octet-stream";
        }
        return ResponseEntity
                .ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    //stream in chunks
    @GetMapping("/stream/range/{videoId}")
    public ResponseEntity<Resource> streamRange(
            @PathVariable String videoId,
            @RequestHeader(value = "Range", required = false) String range ) throws IOException {
            System.out.println(range);

            Video video = videoService.get(videoId);
            Path path = Paths.get(video.getFilePath());

            Resource resource = new FileSystemResource(path);

            String contentType = video.getContentType();
            if(contentType==null){
                contentType = "application/octet-stream";
            }
            //file length
            long fileLength = path.toFile().length();

            if(range == null){
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource); //pehle jaisa unedited bhejdia
            }
            long rangeStart;
            long rangeEnd;

            String[] ranges = range.replace("bytes=", "").split("-");
            rangeStart = Long.parseLong(ranges[0]);
            rangeEnd = rangeStart + AppConstants.CHUNK_SIZE-1;
            if(rangeEnd > fileLength-1){
                rangeEnd = fileLength-1;
            }
//            if(ranges.length >1){
//                rangeEnd = Long.parseLong(ranges[1]);
//            } else{
//                rangeEnd = fileLength-1;
//            }
//            if(rangeEnd > fileLength-1){
//                rangeEnd = fileLength-1;
//            }

            InputStream inputStream;

            try{
                inputStream = new FileInputStream(path.toFile());
                inputStream.skip(rangeStart);
            } catch(IOException ex){
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            long contentLength = rangeEnd - rangeStart + 1;

            byte[] data = new byte[(int)contentLength];
            int read = inputStream.read(data,0, data.length);
            System.out.println("read(number of bytes) : "+ read);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Range", "bytes "+rangeStart+"-"+rangeEnd+"/"+fileLength);
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("X-Content-Type-Options", "nosniff"); //for security purposes
            headers.setContentLength(contentLength);

            return ResponseEntity
                    .status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new ByteArrayResource(data));
    }
    //serve hls playlist

    //master.m2u8 file

    @Value("${file.video.hsl}")
    private String HLS_DIR;

    @GetMapping("/{videoId}/master.m3u8")
    public ResponseEntity<Resource> serverMasterFile(
            @PathVariable String videoId
    ) {

//        creating path
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

    //serve the segments

    @GetMapping("/{videoId}/{segment}.ts")
    public ResponseEntity<Resource> serveSegments(
            @PathVariable String videoId,
            @PathVariable String segment
    ) {

        // create path for segment
        Path path = Paths.get(HLS_DIR, videoId, segment + ".ts");
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

}
