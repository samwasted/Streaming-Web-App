# Build stage with JDK 23 Early Access
FROM openjdk:23-ea-jdk-slim AS build

# Install Maven separately (since there's no official maven:3.9+ image with JDK 23 yet)
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Runtime stage with JRE 23
FROM openjdk:23-ea-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]