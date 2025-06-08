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
                .map(ftp -> new ProcessInfo(ftp.getProcessDefinitionKey(), ftp.getProcessName(), ftp.getTargetRole()))
                .collect(Collectors.toList());
    }

    @Data
    @NoArgsConstructor
    public static class ProcessInfo {
        private String processDefinitionKey;
        private String processName;
        private String targetRole;
        
        public ProcessInfo(String processDefinitionKey, String processName) {
            this.processDefinitionKey = processDefinitionKey;
            this.processName = processName;
        }

        public ProcessInfo(String processDefinitionKey, String processName, String targetRole) {
            this.processDefinitionKey = processDefinitionKey;
            this.processName = processName;
            this.targetRole = targetRole;
        }
    }
}
