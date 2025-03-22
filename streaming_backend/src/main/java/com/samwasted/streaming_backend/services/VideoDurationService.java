package com.samwasted.streaming_backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Service
public class VideoDurationService {

    private static final Logger logger = LoggerFactory.getLogger(VideoDurationService.class);

    @Value("${file.video.hsl}")
    private String HLS_DIR;

    // Get the duration of an HLS video using FFprobe

    public Double getVideoDuration(String videoId) {
        Path hlsPath = Paths.get(HLS_DIR, videoId, "master.m3u8");

        if (!Files.exists(hlsPath)) {
            logger.warn("HLS master playlist not found for videoId: {}", videoId);
            return null;
        }

        try {
            // Build the FFprobe command to get duration
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "ffprobe",
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "json",
                    hlsPath.toString()
            );

            Process process = processBuilder.start();

            // Read the output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }

            // Wait for the process to complete
            boolean completed = process.waitFor(10, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                logger.error("FFprobe process timed out for videoId: {}", videoId);
                return null;
            }

            // Parse the JSON output to extract duration
            String json = output.toString();
            if (json.contains("duration")) {
                int startIndex = json.indexOf("\"duration\":\"") + 12;
                int endIndex = json.indexOf("\"", startIndex);
                if (startIndex > 0 && endIndex > startIndex) {
                    String durationStr = json.substring(startIndex, endIndex);
                    return Double.parseDouble(durationStr);
                }
            }

            logger.warn("Could not extract duration from FFprobe output for videoId: {}", videoId);
            return null;

        } catch (IOException | InterruptedException | NumberFormatException e) {
            logger.error("Error extracting video duration: {}", e.getMessage());
            return null;
        }
    }


     // Alternative method to extract duration by parsing the M3U8 file manually
     //This is less accurate than using FFprobe


    public Double getDurationFromM3U8(String videoId) {
        Path hlsPath = Paths.get(HLS_DIR, videoId, "master.m3u8");

        if (!Files.exists(hlsPath)) {
            return null;
        }

        try {
            // First, read the master playlist to find variant playlist
            String masterContent = Files.readString(hlsPath);
            String[] lines = masterContent.split("\n");
            String variantPath = null;

            // Find the first variant playlist path
            for (String line : lines) {
                if (!line.startsWith("#")) {
                    variantPath = line.trim();
                    break;
                }
            }

            if (variantPath == null) {
                return null;
            }

            // Determine the variant folder name
            String variantFolder = variantPath.replace("/playlist.m3u8", "");

            // Read the variant playlist to sum up segment durations
            Path variantPlaylistPath = Paths.get(HLS_DIR, videoId, variantFolder, "playlist.m3u8");
            if (!Files.exists(variantPlaylistPath)) {
                return null;
            }

            String variantContent = Files.readString(variantPlaylistPath);
            lines = variantContent.split("\n");

            double totalDuration = 0.0;

            for (String line : lines) {
                if (line.startsWith("#EXTINF:")) {
                    // Extract the duration value (format: #EXTINF:duration,)
                    String durationStr = line.substring(8).split(",")[0];
                    try {
                        totalDuration += Double.parseDouble(durationStr);
                    } catch (NumberFormatException e) {
                        logger.warn("Could not parse duration from line: {}", line);
                    }
                }
            }

            return totalDuration > 0 ? totalDuration : null;

        } catch (IOException e) {
            logger.error("Error parsing M3U8 file: {}", e.getMessage());
            return null;
        }
    }
}