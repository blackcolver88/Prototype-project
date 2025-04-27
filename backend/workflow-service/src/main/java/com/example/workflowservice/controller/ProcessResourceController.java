package com.example.workflowservice.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/engine-rest/process-definition")
@CrossOrigin(origins = "*")
public class ProcessResourceController {

    private final Logger logger = LoggerFactory.getLogger(ProcessResourceController.class);
    
    @Value("${project.base-dir:/home/moemen/prototype project/Prototype-project/backend/workflow-service}")
    private String projectBaseDir;

    @PostMapping("/save-to-filesystem")
    public ResponseEntity<?> saveToFilesystem(@RequestBody Map<String, String> request) {
        String xml = request.get("xml");
        String filename = request.get("filename");
        
        logger.info("Received save-to-filesystem request for file: {}", filename);

        if (xml == null || filename == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required parameters"));
        }

        try {
            // Create File objects with proper path handling
            File baseDir = new File(projectBaseDir);
            File sourcesDir = new File(baseDir, "src/main/resources/processes");
            File targetDir = new File(baseDir, "target/classes/processes");
            
            // Ensure directories exist
            if (!sourcesDir.exists() && !sourcesDir.mkdirs()) {
                logger.error("Failed to create source directory: {}", sourcesDir.getAbsolutePath());
                throw new IOException("Cannot create source directory");
            }
            
            if (!targetDir.exists() && !targetDir.mkdirs()) {
                logger.error("Failed to create target directory: {}", targetDir.getAbsolutePath());
                throw new IOException("Cannot create target directory");
            }
            
            // Save to source directory
            File sourceFile = new File(sourcesDir, filename);
            logger.info("Writing to source file: {}", sourceFile.getAbsolutePath());
            
            try (FileWriter writer = new FileWriter(sourceFile)) {
                writer.write(xml);
            }
            
            // Save to target directory for immediate use
            File targetFile = new File(targetDir, filename);
            logger.info("Writing to target file: {}", targetFile.getAbsolutePath());
            
            try (FileWriter writer = new FileWriter(targetFile)) {
                writer.write(xml);
            }
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Process saved successfully",
                    "sourcePath", sourceFile.getAbsolutePath(),
                    "targetPath", targetFile.getAbsolutePath()
            ));
            
        } catch (Exception e) {
            logger.error("Error saving file to filesystem", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to save file: " + e.getMessage(),
                    "details", e.toString()
            ));
        }
    }
}
