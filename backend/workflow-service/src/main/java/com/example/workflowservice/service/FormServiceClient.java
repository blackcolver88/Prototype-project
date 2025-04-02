package com.example.workflowservice.service; // Adjust package

import com.example.workflowservice.DTO.FormSubmissionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FormServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private DiscoveryClient discoveryClient;

    public String getFormDetails(Long formId) {
        String formServiceUrl = getFormServiceUrl();
        return restTemplate.getForObject(formServiceUrl + "/api/forms/" + formId, String.class);
    }

    public void submitForm(FormSubmissionDTO formSubmission) {
        String formServiceUrl = getFormServiceUrl();
        restTemplate.postForObject(formServiceUrl + "/api/forms/" + formSubmission.getFormId() + "/submit",
                formSubmission, Void.class);
    }

    private String getFormServiceUrl() {
        return discoveryClient.getInstances("form-service")
                .stream()
                .findFirst()
                .map(si -> si.getUri().toString())
                .orElseThrow(() -> new RuntimeException("form-service not found"));
    }
}