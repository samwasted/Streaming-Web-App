package com.samwasted.streaming_backend.playload;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(example = "user") @NotBlank String username,
        @Schema(example = "user") @NotBlank String password) {
}
