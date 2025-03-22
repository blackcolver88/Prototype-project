package com.example.formservice.controller;

import com.example.formservice.DTO.FormSubmissionDTO;
import com.example.formservice.DTO.FormValueRequest;
import com.example.formservice.DTO.FormValuesWrapper;
import com.example.formservice.entities.FormSubmission;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.entities.FormValue;
import com.example.formservice.entities.User;
import com.example.formservice.repository.FormTemplateRepository;
import com.example.formservice.repository.FormValueRepository;
import com.example.formservice.service.FormSubmissionService;
import com.example.formservice.service.FormTemplateService;
import com.example.formservice.service.FormValueService;
import com.example.formservice.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/form-submissions")
public class FormSubmissionController {

    private final FormSubmissionService formSubmissionService;
    private final UserService userService;
    private final FormTemplateService formTemplateService;
    private final FormTemplateRepository formRepository;
    private final FormValueService formValueService;

    public FormSubmissionController(FormSubmissionService formSubmissionService,
                                    UserService userService,
                                    FormTemplateService formTemplateService,
                                    FormTemplateRepository formRepository,
                                    FormValueService formValueService) {
        this.formSubmissionService = formSubmissionService;
        this.userService = userService;
        this.formTemplateService = formTemplateService;
        this.formRepository = formRepository;
        this.formValueService = formValueService;
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

    @PatchMapping("/{userId}/{submissionId}")
    public ResponseEntity<?> updateFormSubmission(
            @PathVariable Long userId,
            @PathVariable Long submissionId,
            @RequestBody FormValuesWrapper updatedFormValuesWrapper) {

        Optional<User> user = userService.getUserById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Utilisateur non trouvé."));
        }

        Optional<FormSubmission> optionalSubmission = formSubmissionService.getFormSubmissionById(submissionId);
        if (optionalSubmission.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Soumission non trouvée pour cet ID."));
        }

        FormSubmission submission = optionalSubmission.get();
        if (!submission.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "La soumission ne correspond pas à l'utilisateur spécifié."));
        }

        try {
            List<FormValue> updatedValues = new ArrayList<>();
            for (FormValueRequest valueRequest : updatedFormValuesWrapper.getFormValues()) {
                FormValue value = new FormValue();

                // Validation : vérifier que l'ID du champ d'entrée est fourni
                if (valueRequest.getFormInputId() == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "formInputId manquant dans une des valeurs."));
                }

                // Obtenir les valeurs normalisées
                List<String> allValues = valueRequest.getValues();
                if (allValues == null || allValues.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Aucune valeur fournie pour le champ avec formInputId=" + valueRequest.getFormInputId()));
                }

                // Joindre les valeurs en une chaîne séparée par des virgules
                value.setValue(String.join(",", allValues));

                // Associer la valeur à la soumission
                value.setFormSubmission(submission);
                updatedValues.add(value);
            }

            submission.getFormValues().clear(); 
            submission.getFormValues().addAll(updatedValues); 

            // Enregistrer les modifications
            FormSubmission updatedSubmission = formSubmissionService.save(submission);

            return ResponseEntity.ok(updatedSubmission);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Une erreur est survenue lors de la mise à jour.", "details", e.getMessage()));
        }
    }
    @GetMapping("/submission/{submissionId}/template")
    public ResponseEntity<FormTemplate> getFormTemplateBySubmissionId(@PathVariable Long submissionId) {
        Optional<FormTemplate> formTemplate = formSubmissionService.getFormTemplateBySubmissionId(submissionId);
        if (formTemplate.isPresent()) {
            return ResponseEntity.ok(formTemplate.get());
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/submission/{submissionId}/values")
    public ResponseEntity<?> getFormValuesBySubmissionId(@PathVariable Long submissionId) {
        try {
            List<FormValue> formValues = formValueService.getFormValuesBySubmissionId(submissionId);
            return ResponseEntity.ok(formValues);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving form values: " + e.getMessage());
        }
    }
}
