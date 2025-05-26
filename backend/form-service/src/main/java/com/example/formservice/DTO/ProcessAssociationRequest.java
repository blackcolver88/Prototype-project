package com.example.formservice.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ProcessAssociationRequest {
    private List<ProcessInfo> processes;

    @Data
    @NoArgsConstructor
    public static class ProcessInfo {
        private String processDefinitionKey;
        private String processName;
        
        public ProcessInfo(String processDefinitionKey, String processName) {
            this.processDefinitionKey = processDefinitionKey;
            this.processName = processName;
        }
    }
}
