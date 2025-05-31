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
        
        
        existingSubmission.setDate(updatedSubmission.getDate());
        
        if (updatedSubmission.getFormValues() != null) {
            if (existingSubmission.getFormValues() == null) {
                existingSubmission.setFormValues(new ArrayList<>());
            } else {
                existingSubmission.getFormValues().clear();
            }
            
            for (FormValue formValue : updatedSubmission.getFormValues()) {
                formValue.setFormSubmission(existingSubmission);
                existingSubmission.getFormValues().add(formValue);
            }
        }
        
        return formSubmissionRepository.save(existingSubmission);
    }

    @Transactional
    public FormSubmission updateSubmissionValues(FormSubmission submission, 
                                                 List<FormValueRequest> updatedValues) {
        Map<Long, FormValue> formValueMap = new HashMap<>();
        
        if (submission.getFormValues() != null) {
            for (FormValue value : submission.getFormValues()) {
                for (FormInput input : value.getFormInputs()) {
                    formValueMap.put(input.getId(), value);
                }
            }
        }
        
        for (FormValueRequest valueReq : updatedValues) {
            if (valueReq.getFormInputId() == null || valueReq.getValues() == null || valueReq.getValues().isEmpty()) {
                continue;
            }
            
            Long inputId = valueReq.getFormInputId();
            Optional<FormInput> inputOpt = formInputService.getFormInputById(inputId);
            if (inputOpt.isEmpty()) {
                continue;
            }
            FormInput input = inputOpt.get();
            
            FormValue formValue;
            if (formValueMap.containsKey(inputId)) {
                formValue = formValueMap.get(inputId);
                formValue.setValue(String.join(",", valueReq.getValues()));
            } else {
                formValue = new FormValue();
                formValue.setValue(String.join(",", valueReq.getValues()));
                formValue.setFormSubmission(submission);
                
                formValue.setFormInputs(new ArrayList<>());
                formValue.getFormInputs().add(input);
                
                if (submission.getFormValues() == null) {
                    submission.setFormValues(new ArrayList<>());
                }
                submission.getFormValues().add(formValue);
                
                formValueMap.put(inputId, formValue);
            }
        }
        
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
        Page<FormSubmission> submissionPage = formSubmissionRepository.findAll(pageable);

        for (FormSubmission submission : submissionPage.getContent()) {
            if (submission.getUserId() != null) {
                Optional<UserDTO> userInfo = userService.getUserById(submission.getUserId());
                if (userInfo.isPresent()) {
                    UserDTO user = userInfo.get();
                    submission.setUserTask(user.getFirstname(), user.getLastname());
                }
            }
        }

        return submissionPage;
    }
}
