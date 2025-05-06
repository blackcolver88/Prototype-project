# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Use an official OpenJDK runtime with Java 21 as a parent image
FROM openjdk:21-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the JAR file from the build stage, not from local filesystem
COPY --from=build /app/target/form-service-0.0.1-SNAPSHOT.jar app.jar

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]