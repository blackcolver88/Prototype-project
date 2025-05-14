package com.example.formservice.controller;

import com.example.formservice.DTO.*;
import com.example.formservice.client.WorkflowServiceClient;
import com.example.formservice.entities.*;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormTemplateRepository;
import com.example.formservice.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/form-submissions")
public class FormSubmissionController {

    private final FormSubmissionService formSubmissionService;
    private final UserService userService;
    private final FormTemplateService formTemplateService;
    private final FormTemplateRepository formRepository;
    private final FormValueService formValueService;
    private final FormInputService formInputService;
    private final FormInputRepository formInputRepository;

    @Autowired
    private WorkflowServiceClient workflowServiceClient;

    @Autowired
    private DiscoveryClient discoveryClient;

    public FormSubmissionController(FormSubmissionService formSubmissionService,
                                    UserService userService,
                                    FormTemplateService formTemplateService,
                                    FormTemplateRepository formRepository,
                                    FormValueService formValueService,
                                    FormInputService formInputService,
                                    FormInputRepository formInputRepository) {
        this.formSubmissionService = formSubmissionService;
        this.userService = userService;
        this.formTemplateService = formTemplateService;
        this.formRepository = formRepository;
        this.formValueService = formValueService;
        this.formInputService = formInputService;
        this.formInputRepository = formInputRepository;
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

        log.info("Received form submission request for userId: {} and formId: {}", userId, formId);
        log.info("Form values wrapper: {}", formValuesWrapper);  // Add this line

        try {
            Optional<UserDTO> user = userService.getUserById(userId);
            log.info("User found: {}, details: {}", user.isPresent(), user.orElse(null));

            Optional<FormTemplate> form = formRepository.findById(formId);
            log.info("Form found: {}", form.isPresent());

            // More logging
            boolean submissionExists = formSubmissionService.existsByUserIdAndFormId(userId, formId);
            log.info("Submission exists: {}", submissionExists);

            if (user.isEmpty() || form.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            if (submissionExists) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Vous avez déjà soumis ce formulaire."));
            }

            FormSubmission submission = new FormSubmission();
            submission.setUserId(userId);
            submission.setDate(LocalDateTime.now());
            submission.setIdForm(formId);
            try {
                submission.setUserTask(user.get().getFirstname(), user.get().getLastname());
                log.info("User task set successfully: {}", submission.getUserTask());
            } catch (Exception e) {
                log.error("Error setting user task", e);
            }

            // More detailed logging for the rest of the process
            log.info("Processing {} form values", formValuesWrapper.getFormValues().size());

            List<FormValue> values = new ArrayList<>();

            List<FormLayout> layouts = formTemplateService.getFormLayoutById(formId);

            List<FormInput> allFormInputs = new ArrayList<>();
            for (FormLayout layout : layouts) {
                List<FormInput> sectionInputs = formInputRepository.findByFormLayoutId(layout.getId());
                allFormInputs.addAll(sectionInputs);
            }

            Map<Long, FormInput> formInputsMap = allFormInputs.stream()
                    .collect(Collectors.toMap(FormInput::getId, input -> input));

            System.out.println("Total form inputs found across all sections: " + allFormInputs.size());

            for (FormValueRequest valueRequest : formValuesWrapper.getFormValues()) {
                if (valueRequest.getValues() == null || valueRequest.getValues().isEmpty()) {
                    continue;
                }

                if (valueRequest.getFormInputId() == null) {
                    continue;
                }

                FormInput correspondingInput = formInputsMap.get(valueRequest.getFormInputId());
                if (correspondingInput == null) {
                    System.out.println("Warning: No FormInput found for ID: " + valueRequest.getFormInputId());
                    continue;
                }

                FormValue value = new FormValue();
                value.setValue(String.join(",", valueRequest.getValues()));
                value.setFormSubmission(submission);

                value.getFormInputs().add(correspondingInput);
                correspondingInput.setFormValue(value);

                values.add(value);
            }

            submission.setFormValues(values);
            log.info("About to save submission");
            FormSubmission savedSubmission = formSubmissionService.save(submission);
            log.info("Submission saved successfully with ID: {}", savedSubmission.getId());

            FormSubmissionDTO formSubmissionDTO = new FormSubmissionDTO();
            formSubmissionDTO.setId(savedSubmission.getId());
            formSubmissionDTO.setDate(savedSubmission.getDate());
            formSubmissionDTO.setUserId(userId);
            // Use firstname + lastname as task instead of the old user.getTask()
            formSubmissionDTO.setTask(user.get().getFirstname() + " " + user.get().getLastname());
            formSubmissionDTO.setFormId(formId);

            if (formValuesWrapper.getProcessDefinitionKey() != null) {
                formSubmissionDTO.setProcessDefinitionKey(formValuesWrapper.getProcessDefinitionKey());
            }

            formSubmissionDTO.setFormValues(values.stream()
                    .map(fv -> {
                        String title = fv.getFormInputs() != null && !fv.getFormInputs().isEmpty()
                                ? formInputService.getFormInputTitleById(fv.getFormInputs().get(0).getId())
                                : "Untitled";
                        return new FormValueDTO(title, fv.getValue());
                    })
                    .collect(Collectors.toList()));

            try {
                String workflowUrl = discoveryClient.getInstances("workflow-service")
                        .stream()
                        .findFirst()
                        .map(si -> si.getUri() + "/api/workflow/start-process")
                        .orElseThrow(() -> new RuntimeException("workflow-service not found"));
                workflowServiceClient.startProcess(formSubmissionDTO);
            } catch (Exception e) {
                System.err.println("Failed to notify workflow-service: " + e.getMessage());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubmission);
        } catch (Exception e) {
            log.error("Error processing form submission", e);
            e.printStackTrace(); // Add this to print the full stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while processing your submission: " + e.getMessage()));
        }
    }


   
    private void collectAllFormInputs(List<FormLayout> layouts, Map<Long, FormInput> formInputsMap) {
        for (FormLayout layout : layouts) {
            List<FormInput> directInputs = formInputRepository.findByFormLayoutId(layout.getId());
            for (FormInput input : directInputs) {
                formInputsMap.put(input.getId(), input);
            }

            if (layout.getChildren() != null && !layout.getChildren().isEmpty()) {
                collectAllFormInputs(layout.getChildren(), formInputsMap);
            }
        }
    }

    private void updateFormInputWithFormValueId(FormSubmission submission) {
        List<FormInput> formInputs = formInputRepository.findByFormLayoutId(submission.getIdForm());
        List<FormValue> formValues = submission.getFormValues();

        for (int i = 0; i < formInputs.size() && i < formValues.size(); i++) {
            FormInput formInput = formInputs.get(i);
            FormValue formValue = formValues.get(i);

            formInput.setFormValue(formValue);
            formInputRepository.save(formInput);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FormSubmissionDTO>> getUserFormSubmissions(@PathVariable Long userId) {
        Optional<UserDTO> userOptional = userService.getUserById(userId);
        if (userOptional.isPresent()) {
            UserDTO user = userOptional.get();
            List<FormSubmission> submissions = formSubmissionService.getFormSubmissionsByUserId(userId);

            List<FormSubmissionDTO> submissionDTOs = new ArrayList<>();

            for (FormSubmission submission : submissions) {
                String formTitle = formTemplateService.getFormTemplateTitleById(submission.getIdForm());

                FormSubmissionDTO dto = new FormSubmissionDTO(
                        submission.getId(),
                        submission.getDate(),
                        submission.getUserTask(), // Using getUserTask() instead of user.getTask()
                        formTitle,
                        submission.getFormValues().stream()
                                .map(FormValue::getValue)
                                .collect(Collectors.toList()));

                submissionDTOs.add(dto);
            }

            return ResponseEntity.ok(submissionDTOs);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}/form/{formId}")
    public ResponseEntity<List<FormSubmissionDTO>> getFormSubmissionsByUserAndForm(
            @PathVariable Long userId,
            @PathVariable Long formId) {
        List<FormSubmission> submissions = formSubmissionService.getFormSubmissionsByUserAndForm(userId, formId);

        if (submissions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        String formTitle = formTemplateService.getFormTemplateTitleById(formId);

        List<FormSubmissionDTO> submissionDTOs = submissions.stream()
                .map(submission -> FormSubmissionDTO.formFormSubmission(submission, formTitle, formInputService))
                .collect(Collectors.toList());

        return ResponseEntity.ok(submissionDTOs);
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

        Optional<UserDTO> userOptional = userService.getUserById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Utilisateur non trouvé."));
        }

        Optional<FormSubmission> optionalSubmission = formSubmissionService.getFormSubmissionById(submissionId);
        if (optionalSubmission.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Soumission non trouvée pour cet ID."));
        }

        FormSubmission submission = optionalSubmission.get();
        if (!submission.getUserId().equals(userId)) { // Using getUserId() instead of getUser().getId()
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "La soumission ne correspond pas à l'utilisateur spécifié."));
        }

        try {
            Map<Long, FormValue> existingValueMap = new HashMap<>();

            List<FormValue> originalFormValues = new ArrayList<>();
            if (submission.getFormValues() != null) {
                originalFormValues.addAll(submission.getFormValues());

                for (FormValue existingValue : submission.getFormValues()) {
                    for (FormInput input : existingValue.getFormInputs()) {
                        existingValueMap.put(input.getId(), existingValue);
                    }
                }
            }

            Set<FormValue> processedValues = new HashSet<>();

            for (FormValueRequest valueRequest : updatedFormValuesWrapper.getFormValues()) {
                if (valueRequest.getFormInputId() == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "formInputId manquant dans une des valeurs."));
                }

                List<String> allValues = valueRequest.getValues();
                if (allValues == null || allValues.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Aucune valeur fournie pour le champ avec formInputId="
                                    + valueRequest.getFormInputId()));
                }

                Optional<FormInput> formInputOpt = formInputService.getFormInputById(valueRequest.getFormInputId());
                if (formInputOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "FormInput non trouvé avec ID=" + valueRequest.getFormInputId()));
                }
                FormInput formInput = formInputOpt.get();

                FormValue formValue;
                if (existingValueMap.containsKey(valueRequest.getFormInputId())) {
                    // Use existing FormValue
                    formValue = existingValueMap.get(valueRequest.getFormInputId());
                    // Update the value
                    formValue.setValue(String.join(",", allValues));
                } else {
                    // Create a new FormValue
                    formValue = new FormValue();
                    formValue.setValue(String.join(",", allValues));
                    formValue.setFormSubmission(submission);
                    formValue.setFormInputs(new ArrayList<>());
                    formValue.getFormInputs().add(formInput);

                    formInput.setFormValue(formValue);
                }

                processedValues.add(formValue);
            }

            if (submission.getFormValues() == null) {
                submission.setFormValues(new ArrayList<>());
            } else {
                List<FormValue> updatedValues = new ArrayList<>();

                for (FormValue original : originalFormValues) {
                    if (processedValues.contains(original)) {
                        updatedValues.add(original);
                        processedValues.remove(original);
                    }
                }

                updatedValues.addAll(processedValues);

                submission.getFormValues().clear();
                submission.getFormValues().addAll(updatedValues);
            }

            FormSubmission updatedSubmission = formSubmissionService.save(submission);

            return ResponseEntity.ok(updatedSubmission);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Une erreur est survenue lors de la mise à jour.", "details",
                            e.getMessage()));
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

    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getAdminFormSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int limit) {

        // Récupérer les soumissions paginées depuis le service
        Page<FormSubmission> submissionPage = formSubmissionService.getAllFormSubmissions(page, limit);

        // Mapper les soumissions vers des DTOs
        List<FormSubmissionDTO> submissionDTOs = submissionPage.getContent().stream()
                .map(submission -> {
                    String formTitle = formTemplateService.getFormTemplateTitleById(submission.getIdForm());

                    return new FormSubmissionDTO(
                            submission.getId(),
                            submission.getDate(),
                            submission.getUserTask(), // Using getUserTask() instead of user.getTask()
                            formTitle,
                            submission.getFormValues().stream()
                                    .map(FormValue::getValue)
                                    .collect(Collectors.toList()));
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", submissionDTOs);
        response.put("currentPage", submissionPage.getNumber());
        response.put("totalItems", submissionPage.getTotalElements());
        response.put("totalPages", submissionPage.getTotalPages());

        return ResponseEntity.ok(response);
    }
}