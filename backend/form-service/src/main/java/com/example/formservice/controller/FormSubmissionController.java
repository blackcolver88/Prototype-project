package com.example.formservice.controller;

import com.example.formservice.DTO.FormSubmissionDTO;
import com.example.formservice.DTO.FormValueRequest;
import com.example.formservice.DTO.FormValuesWrapper;
import com.example.formservice.entities.FormSubmission;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.entities.FormValue;
import com.example.formservice.entities.User;
import com.example.formservice.repository.FormTemplateRepository;
import com.example.formservice.service.FormSubmissionService;
import com.example.formservice.service.FormTemplateService;
import com.example.formservice.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/form-submissions")
public class FormSubmissionController {

    private final FormSubmissionService formSubmissionService;
    private final UserService userService;
    private final FormTemplateService formTemplateService;
    private final FormTemplateRepository formRepository;

    public FormSubmissionController(FormSubmissionService formSubmissionService,
                                    UserService userService,
                                    FormTemplateService formTemplateService,
                                    FormTemplateRepository formRepository) {
        this.formSubmissionService = formSubmissionService;
        this.userService = userService;
        this.formTemplateService = formTemplateService;
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
    public ResponseEntity<?> submitForm(
            @PathVariable Long userId,
            @PathVariable Long formId,
            @RequestBody FormValuesWrapper formValuesWrapper) {

      
        Optional<User> user = userService.getUserById(userId);
        Optional<FormTemplate> form = formRepository.findById(formId);

        if (user.isPresent() && form.isPresent()) {
            boolean submissionExists = formSubmissionService.existsByUserIdAndFormId(userId, formId);
            if (submissionExists) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Vous avez déjà soumis ce formulaire.");
            }

            
            FormSubmission submission = new FormSubmission();
            submission.setUser(user.get());
            submission.setDate(LocalDateTime.now());
            submission.setIdForm(formId); // Définir l'ID du formulaire

            // Traiter les valeurs du formulaire
            List<FormValue> values = new ArrayList<>();
            for (FormValueRequest valueRequest : formValuesWrapper.getFormValues()) {
                FormValue value = new FormValue();

                List<String> allValues = valueRequest.getValues();
                if (!allValues.isEmpty()) {
                    value.setValue(String.join(",", allValues));
                }

                value.setFormSubmission(submission); // Associer la valeur à la soumission
                values.add(value);
            }

            // Définir les valeurs du formulaire dans la soumission
            submission.setFormValues(values);

            // Enregistrer la soumission
            FormSubmission savedSubmission = formSubmissionService.save(submission);
            return ResponseEntity.ok(savedSubmission); // Retourner la soumission enregistrée
        }

 
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FormSubmissionDTO>> getUserFormSubmissions(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
          
            List<FormSubmission> submissions = formSubmissionService.getFormSubmissionsByUserId(userId);

            List<FormSubmissionDTO> submissionDTOs = new ArrayList<>();

            for (FormSubmission submission : submissions) {
                
           String formTitle = formTemplateService.getFormTemplateTitleById(submission.getIdForm());

              
                FormSubmissionDTO dto = new FormSubmissionDTO(
                        submission.getId(),
                        submission.getDate(),
                        submission.getUser().getTask(), 
                        formTitle,
                        submission.getFormValues().stream()
                                .map(FormValue::getValue) // Valeurs des champs remplis
                                .collect(Collectors.toList())
                );

                submissionDTOs.add(dto);
            }

            return ResponseEntity.ok(submissionDTOs);
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/user/{userId}/form/{formId}")
    public ResponseEntity<List<FormSubmission>> getFormSubmissionsByUserAndForm(
            @PathVariable Long userId,
            @PathVariable Long formId) {

        List<FormSubmission> submissions = formSubmissionService.getFormSubmissionsByUserAndForm(userId, formId);

        if (submissions.isEmpty()) {
            return ResponseEntity.noContent().build(); 
        }

        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/check-submission/{userId}/{formId}")
    public ResponseEntity<Boolean> checkIfSubmissionExists(
            @PathVariable Long userId,
            @PathVariable Long formId) {

        boolean submissionExists = formSubmissionService.existsByUserIdAndFormId(userId, formId);
        return ResponseEntity.ok(submissionExists);
    }
}
