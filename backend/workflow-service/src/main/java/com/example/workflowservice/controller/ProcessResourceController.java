package com.example.workflowservice.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.FileWriter;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProcessResourceController {

    private final Logger logger = LoggerFactory.getLogger(ProcessResourceController.class);
    
    private final String processesPath = "/home/moemen/prototype project/Prototype-project/backend/workflow-service/src/main/resources/processes";
    
    private final String tempDir = System.getProperty("java.io.tmpdir");

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        logger.info("Test endpoint reached");
        return ResponseEntity.ok(Map.of("status", "Controller is working"));
    }

    @PostMapping("/save-process")
    public ResponseEntity<?> saveToFilesystem(@RequestBody Map<String, String> request) {
        String xml = request.get("xml");
        String filename = request.get("filename");
        
        logger.info("Received save-process request for file: {}", filename);
        logger.debug("Using processes directory: {}", processesPath);

        if (xml == null || filename == null) {
            logger.error("Missing required parameters");
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required parameters"));
        }
        
        try {
            File sourcesDir = new File(processesPath);
            
            // Make sure the directory exists
            if (!sourcesDir.exists()) {
                logger.info("Creating directory: {}", sourcesDir.getAbsolutePath());
                if (!sourcesDir.mkdirs()) {
                    logger.error("Failed to create directory: {}", sourcesDir.getAbsolutePath());
                }
            }
            
            // Save the file to the correct location
            File sourceFile = new File(sourcesDir, filename);
            try (FileWriter writer = new FileWriter(sourceFile)) {
                writer.write(xml);
                logger.info("Successfully saved to: {}", sourceFile.getAbsolutePath());
                
                // Also save to target/classes/processes for immediate runtime use
                String targetPath = processesPath.replace("/src/main/", "/target/classes/");
                File targetDir = new File(targetPath);
                if (!targetDir.exists()) {
                    targetDir.mkdirs();
                }
                
                try (FileWriter targetWriter = new FileWriter(new File(targetDir, filename))) {
                    targetWriter.write(xml);
                    logger.info("Also saved to runtime directory: {}", targetDir.getAbsolutePath());
                }
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "File saved successfully",
                    "path", sourceFile.getAbsolutePath()
                ));
            }
        } catch (Exception e) {
            logger.error("Error saving file", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to save file: " + e.getMessage()
            ));
        }
    }
}
