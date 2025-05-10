# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Create Maven wrapper files
RUN mkdir -p .mvn/wrapper
RUN echo "distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.5/apache-maven-3.9.5-bin.zip" > .mvn/wrapper/maven-wrapper.properties

# Copy project files
COPY pom.xml .
COPY src ./src

# Build
RUN mvn clean package -DskipTests

# Use an official OpenJDK runtime with Java 21 as a parent image
FROM openjdk:21-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the JAR file from the build stage - using wildcard to match any jar
COPY --from=build /app/target/*.jar app.jar

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]