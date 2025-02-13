package com.example.formservice.controller;

import com.example.formservice.entities.FormSubmission;
import com.example.formservice.service.FormSubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/form-submissions")
public class FormSubmissionController {

    private final FormSubmissionService formSubmissionService;

    public FormSubmissionController(FormSubmissionService formSubmissionService) {
        this.formSubmissionService = formSubmissionService;
    }

    @GetMapping
    public List<FormSubmission> getAllFormSubmissions() {
        return formSubmissionService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<FormSubmission> getFormSubmissionById(@PathVariable Long id) {
        return formSubmissionService.getFormSubmissionById(id);
    }

    @PostMapping
    public FormSubmission createFormSubmission(@RequestBody FormSubmission formSubmission) {
        return formSubmissionService.save(formSubmission);
    }

    @PutMapping("/{id}")
    public FormSubmission updateFormSubmission(@PathVariable Long id, @RequestBody FormSubmission formSubmission) {
        return formSubmissionService.updateFormSubmission(id, formSubmission);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormSubmission(@PathVariable Long id) {
        formSubmissionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
