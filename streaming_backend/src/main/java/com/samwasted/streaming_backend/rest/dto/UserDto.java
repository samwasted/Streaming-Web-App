package com.samwasted.streaming_backend.rest.dto;

import java.time.Instant;
import java.util.List;
import com.samwasted.streaming_backend.user.User;

public record UserDto(Long id, String username, String name, String email, String role) {

  

    public static UserDto from(User user) {
      

        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getRole()

                
        );
    }
}