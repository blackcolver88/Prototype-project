package com.example.formservice.controller;

import com.example.formservice.DTO.FormValueRequest;
import com.example.formservice.DTO.FormValuesWrapper;
import com.example.formservice.entities.FormSubmission;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.entities.FormValue;
import com.example.formservice.entities.User;
import com.example.formservice.repository.FormTemplateRepository;
import com.example.formservice.service.FormSubmissionService;
import com.example.formservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/form-submissions")
public class FormSubmissionController {

    private final FormSubmissionService formSubmissionService;
    private final UserService userService;
    private final FormTemplateRepository formRepository;

    public FormSubmissionController(FormSubmissionService formSubmissionService,
                                    UserService userService,
                                    FormTemplateRepository formRepository) {
        this.formSubmissionService = formSubmissionService;
        this.userService = userService;
        this.formRepository = formRepository;
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

    @PostMapping("/{userId}/{formId}")
    public ResponseEntity<FormSubmission> submitForm(
            @PathVariable Long userId,
            @PathVariable Long formId,
            @RequestBody FormValuesWrapper formValuesWrapper) {

        Optional<User> user = userService.getUserById(userId);
        Optional<FormTemplate> form = formRepository.findById(formId);

        if (user.isPresent() && form.isPresent()) {
            FormSubmission submission = new FormSubmission();
            submission.setUser(user.get());
            submission.setDate(LocalDateTime.now());

            List<FormValue> values = new ArrayList<>();
            for (FormValueRequest valueRequest : formValuesWrapper.getFormValues()) {
                FormValue value = new FormValue();

                List<String> allValues = valueRequest.getValues();
                if (!allValues.isEmpty()) {
                    value.setValue(String.join(",", allValues)); // Convertir la liste en une chaîne séparée par des virgules
                }

                value.setFormSubmission(submission);
                values.add(value);
            }

            submission.setFormValues(values);
            FormSubmission savedSubmission = formSubmissionService.save(submission);
            return ResponseEntity.ok(savedSubmission);
        }

        return ResponseEntity.notFound().build();
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FormSubmission>> getUserFormSubmissions(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            List<FormSubmission> submissions = user.get().getFormSubmissions();
            return ResponseEntity.ok(submissions);
        }
        return ResponseEntity.notFound().build();
    }
}
