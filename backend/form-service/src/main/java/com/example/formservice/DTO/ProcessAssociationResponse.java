package com.example.formservice.DTO;

import com.example.formservice.entities.FormTemplateProcess;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class ProcessAssociationResponse {
    private Long formTemplateId;
    private List<ProcessInfo> associatedProcesses;

    public ProcessAssociationResponse(Long formTemplateId, List<FormTemplateProcess> formTemplateProcesses) {
        this.formTemplateId = formTemplateId;
        this.associatedProcesses = formTemplateProcesses.stream()
                .map(ftp -> new ProcessInfo(ftp.getProcessDefinitionKey(), ftp.getProcessName()))
                .collect(Collectors.toList());
    }

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
