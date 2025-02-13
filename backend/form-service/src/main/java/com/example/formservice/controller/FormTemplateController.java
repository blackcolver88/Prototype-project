package com.example.formservice.controller;

import com.example.formservice.entities.FormTemplate;
import com.example.formservice.service.FormTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/form-templates")
public class FormTemplateController {

    private final FormTemplateService formTemplateService;

    public FormTemplateController(FormTemplateService formTemplateService) {
        this.formTemplateService = formTemplateService;
    }

    @GetMapping
    public List<FormTemplate> getAllFormTemplates() {
        return formTemplateService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<FormTemplate> getFormTemplateById(@PathVariable Long id) {
        return formTemplateService.getFormTemplateById(id);
    }

    @PutMapping("/{id}")
    public FormTemplate updateFormLayout(@PathVariable Long id, @RequestBody FormTemplate formTemplate) {
        return formTemplateService.updateFormTemplate(id, formTemplate);
    }

    @PostMapping
    public FormTemplate createFormTemplate(@RequestBody FormTemplate formTemplate) {
        return formTemplateService.save(formTemplate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormTemplate(@PathVariable("id") Long id) {
        formTemplateService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

