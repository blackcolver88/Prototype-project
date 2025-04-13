package com.example.workflowservice.service; // Adjust package

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FormServiceClient {


    @Autowired
    private DiscoveryClient discoveryClient;

    private String getFormServiceUrl() {
        return discoveryClient.getInstances("form-service")
                .stream()
                .findFirst()
                .map(si -> si.getUri().toString())
                .orElseThrow(() -> new RuntimeException("form-service not found"));
    }
}