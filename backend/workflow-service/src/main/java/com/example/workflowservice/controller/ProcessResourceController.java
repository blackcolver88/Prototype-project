package com.example.workflowservice.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.DeploymentBuilder;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.ProcessDefinition;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProcessResourceController {

    private final Logger logger = LoggerFactory.getLogger(ProcessResourceController.class);
    
    private final String processesPath = "/home/moemen/prototype project/Prototype-project/backend/workflow-service/src/main/resources/processes";
    
    private final String tempDir = System.getProperty("java.io.tmpdir");

    private final org.camunda.bpm.engine.ProcessEngine processEngine;

    public ProcessResourceController(org.camunda.bpm.engine.ProcessEngine processEngine) {
        this.processEngine = processEngine;
    }

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
            
            if (!sourcesDir.exists()) {
                logger.info("Creating directory: {}", sourcesDir.getAbsolutePath());
                if (!sourcesDir.mkdirs()) {
                    logger.error("Failed to create directory: {}", sourcesDir.getAbsolutePath());
                }
            }
            
            File sourceFile = new File(sourcesDir, filename);
            try (FileWriter writer = new FileWriter(sourceFile)) {
                writer.write(xml);
                logger.info("Successfully saved to: {}", sourceFile.getAbsolutePath());
                
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

    @PostMapping("/deploy-from-resources")
    public ResponseEntity<?> deployFromResources(@RequestBody Map<String, String> request) {
        String filename = request.get("filename");
        try {
            File file = new File(processesPath, filename);
            if (!file.exists()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File not found"));
            }

            // Use Camunda API to deploy
            RepositoryService repositoryService = processEngine.getRepositoryService();
            DeploymentBuilder deployment = repositoryService.createDeployment()
                .name("Deployed from resources")
                .addInputStream(filename, new FileInputStream(file));
            
            Deployment result = deployment.deploy();
            return ResponseEntity.ok(Map.of("success", true, "deploymentId", result.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list-process-files")
    public ResponseEntity<?> listProcessFiles() {
        try {
            File directory = new File(processesPath);
            if (!directory.exists() || !directory.isDirectory()) {
                logger.warn("Process directory does not exist: {}", processesPath);
                return ResponseEntity.ok(List.of());
            }
            
            File[] files = directory.listFiles((dir, name) -> name.toLowerCase().endsWith(".bpmn"));
            if (files == null) {
                logger.warn("Failed to list files in directory: {}", processesPath);
                return ResponseEntity.ok(List.of());
            }
            
            // Get all deployed process definition keys for comparison
            RepositoryService repositoryService = processEngine.getRepositoryService();
            List<ProcessDefinition> deployedProcesses = repositoryService.createProcessDefinitionQuery()
                .latestVersion()
                .list();
            
            List<String> deployedKeys = deployedProcesses.stream()
                .map(ProcessDefinition::getKey)
                .collect(Collectors.toList());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (File file : files) {
                // Try to extract process key from filename (assuming filename format like "process_key.bpmn")
                String filename = file.getName();
                String presumedKey = filename.replace(".bpmn", "");
                
                Map<String, Object> fileInfo = new HashMap<>();
                fileInfo.put("filename", filename);
                fileInfo.put("path", file.getAbsolutePath());
                fileInfo.put("size", file.length());
                fileInfo.put("lastModified", file.lastModified());
                fileInfo.put("deployed", deployedKeys.contains(presumedKey));
                
                result.add(fileInfo);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error listing process files", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to list process files: " + e.getMessage()
            ));
        }
    }
}
