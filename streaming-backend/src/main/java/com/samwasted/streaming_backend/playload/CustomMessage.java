package com.samwasted.streaming_backend.playload;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CustomMessage<T> {
    private String message;
    private boolean success;
    private T data;
    private String fileName;  // Added fileName field
    
    // Getters and setters
    // ...
    
    public static <T> Builder<T> builder() {
        return new Builder<>();
    }
    
    public static class Builder<T> {
        private String message;
        private boolean success;
        private T data;
        private String fileName;  // Added fileName field
        
        public Builder<T> message(String message) {
            this.message = message;
            return this;
        }
        
        public Builder<T> success(boolean success) {
            this.success = success;
            return this;
        }
        
        public Builder<T> data(T data) {
            this.data = data;
            return this;
        }
        
        public Builder<T> fileName(String fileName) {  // Added fileName method
            this.fileName = fileName;
            return this;
        }
        
        public CustomMessage<T> build() {
            CustomMessage<T> customMessage = new CustomMessage<>();
            customMessage.message = this.message;
            customMessage.success = this.success;
            customMessage.data = this.data;
            customMessage.fileName = this.fileName;  // Added fileName assignment
            return customMessage;
        }
    }
}
