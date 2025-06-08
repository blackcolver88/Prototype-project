package com.example.formservice.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@EqualsAndHashCode(exclude = {"formTemplate"})
@ToString(exclude = {"formTemplate"})
@Table(name = "form_template_process")
public class FormTemplateProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_definition_key", nullable = false)
    private String processDefinitionKey;

    @Column(name = "process_name")
    private String processName;

    @Column(name = "target_role")
    private String targetRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_template_id", nullable = false)
    @JsonIgnore
    private FormTemplate formTemplate;

    public FormTemplateProcess() {}

    public FormTemplateProcess(String processDefinitionKey, String processName, FormTemplate formTemplate) {
        this.processDefinitionKey = processDefinitionKey;
        this.processName = processName;
        this.formTemplate = formTemplate;
    }

    public FormTemplateProcess(String processDefinitionKey, String processName, String targetRole, FormTemplate formTemplate) {
        this.processDefinitionKey = processDefinitionKey;
        this.processName = processName;
        this.targetRole = targetRole;
        this.formTemplate = formTemplate;
    }
}
