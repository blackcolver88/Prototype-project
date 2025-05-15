package com.example.formservice.service;

import com.example.formservice.DTO.FormValueDTO;
import com.example.formservice.DTO.FormValueRequest;
import com.example.formservice.DTO.UserDTO;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormSubmission;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.entities.FormValue;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormSubmissionRepository;
import com.example.formservice.repository.FormTemplateRepository;
import com.example.formservice.repository.FormValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FormSubmissionService {
    private final FormSubmissionRepository formSubmissionRepository;
    private final FormInputRepository formInputRepository;
    private final FormTemplateRepository formTemplateRepository;
    private final FormValueRepository formValueRepository;
    private final UserService userService;
    private final FormInputService formInputService;

    @Autowired
    public FormSubmissionService(FormSubmissionRepository formSubmissionRepository, FormInputRepository formInputRepository,
                                  FormTemplateRepository formTemplateRepository, FormValueRepository formValueRepository,
                                  UserService userService, FormInputService formInputService) {
        this.formSubmissionRepository = formSubmissionRepository;
        this.formInputRepository = formInputRepository;
        this.formTemplateRepository = formTemplateRepository;
        this.formValueRepository = formValueRepository;
        this.userService = userService;
        this.formInputService = formInputService;
    }

    public List<FormSubmission> findAll() {
        return formSubmissionRepository.findAll();
    }

    public Optional<FormSubmission> getFormSubmissionById(Long id) {
        return formSubmissionRepository.findById(id);
    }

    public FormSubmission save(FormSubmission formSubmission) {
        return formSubmissionRepository.save(formSubmission);
    }

    public void deleteById(Long id) {
        formSubmissionRepository.deleteById(id);
    }

    @Transactional
    public FormSubmission updateFormSubmission(Long id, FormSubmission updatedSubmission) {
        FormSubmission existingSubmission = formSubmissionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("FormSubmission with id " + id + " does not exist"));
        
        // Keep the existing basic properties
        existingSubmission.setDate(updatedSubmission.getDate());
        
        // Handle form values carefully to prevent circular references
        if (updatedSubmission.getFormValues() != null) {
            // If the existing submission doesn't have values, initialize the list
            if (existingSubmission.getFormValues() == null) {
                existingSubmission.setFormValues(new ArrayList<>());
            } else {
                // Clear existing values to avoid stale references
                existingSubmission.getFormValues().clear();
            }
            
            // Add updated values back with proper references
            for (FormValue formValue : updatedSubmission.getFormValues()) {
                // Set the proper parent reference
                formValue.setFormSubmission(existingSubmission);
                existingSubmission.getFormValues().add(formValue);
            }
        }
        
        // Save and return
        return formSubmissionRepository.save(existingSubmission);
    }

    @Transactional
    public FormSubmission updateSubmissionValues(FormSubmission submission, 
                                                 List<FormValueRequest> updatedValues) {
        // Create a map to track form input IDs to form values
        Map<Long, FormValue> formValueMap = new HashMap<>();
        
        // Track existing FormValues by input ID for updating
        if (submission.getFormValues() != null) {
            for (FormValue value : submission.getFormValues()) {
                for (FormInput input : value.getFormInputs()) {
                    formValueMap.put(input.getId(), value);
                }
            }
        }
        
        // Process each updated value
        for (FormValueRequest valueReq : updatedValues) {
            if (valueReq.getFormInputId() == null || valueReq.getValues() == null || valueReq.getValues().isEmpty()) {
                continue;
            }
            
            // Get the form input
            Long inputId = valueReq.getFormInputId();
            Optional<FormInput> inputOpt = formInputService.getFormInputById(inputId);
            if (inputOpt.isEmpty()) {
                continue;
            }
            FormInput input = inputOpt.get();
            
            // Get or create the form value
            FormValue formValue;
            if (formValueMap.containsKey(inputId)) {
                // Update existing value
                formValue = formValueMap.get(inputId);
                formValue.setValue(String.join(",", valueReq.getValues()));
            } else {
                // Create new value
                formValue = new FormValue();
                formValue.setValue(String.join(",", valueReq.getValues()));
                formValue.setFormSubmission(submission);
                
                formValue.setFormInputs(new ArrayList<>());
                formValue.getFormInputs().add(input);
                
                // Add to submission
                if (submission.getFormValues() == null) {
                    submission.setFormValues(new ArrayList<>());
                }
                submission.getFormValues().add(formValue);
                
                formValueMap.put(inputId, formValue);
            }
        }
        
        // Save and return the updated submission
        return formSubmissionRepository.save(submission);
    }

    public boolean existsByUserIdAndFormId(Long userId, Long formId) {
        return formSubmissionRepository.existsByUserIdAndIdForm(userId, formId);
    }

    public List<FormSubmission> getFormSubmissionsByUserId(Long userId) {
        List<FormSubmission> submissions = formSubmissionRepository.findByUserId(userId);

        Optional<UserDTO> userInfo = userService.getUserById(userId);

        if (userInfo.isPresent()) {
            UserDTO user = userInfo.get();
            for (FormSubmission submission : submissions) {
                submission.setUserTask(user.getFirstname() + " " + user.getLastname());
            }
        }

        return submissions;
    }

    private List<FormValueDTO> getFormValuesWithTitles(Long submissionId) {
        return formValueRepository.findByFormSubmissionId(submissionId).stream()
                .map(formValue -> {
                    // Instead of using findByFormValue which no longer exists
                    // Use the first FormInput from the ManyToMany relationship
                    String title = "Unknown";
                    if (formValue.getFormInputs() != null && !formValue.getFormInputs().isEmpty()) {
                        title = formValue.getFormInputs().get(0).getTitle();
                    }

                    return new FormValueDTO(title, formValue.getValue());
                })
                .collect(Collectors.toList());
    }

    public List<FormSubmission> getFormSubmissionsByUserAndForm(Long userId, Long formId) {
        return formSubmissionRepository.findByUserIdAndFormId(userId, formId);
    }

    public Optional<FormTemplate> getFormTemplateBySubmissionId(Long submissionId) {
        Optional<FormSubmission> submission = formSubmissionRepository.findById(submissionId);
        if (submission.isPresent()) {
            Long formId = submission.get().getIdForm();
            return formTemplateRepository.findById(formId);
        }
        return Optional.empty();
    }

    public Page<FormSubmission> getAllFormSubmissions(int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("date").descending());
        return formSubmissionRepository.findAll(pageable);
    }
}
