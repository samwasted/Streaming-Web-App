package com.samwasted.streaming_backend;

import com.samwasted.streaming_backend.services.VideoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class StreamingBackendApplicationTests {
	@Autowired
	VideoService videoService;
	@Test
	void contextLoads() {
		videoService.processVideo("8082f30c-d740-4f71-9cd7-3ffc8e101f3d");
	}

}
