package com.example.formservice.service;

import com.example.formservice.DTO.FormSubmissionDTO;
import com.example.formservice.DTO.FormValueDTO;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormSubmission;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormSubmissionRepository;
import com.example.formservice.repository.FormTemplateRepository;
import com.example.formservice.repository.FormValueRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FormSubmissionService {
    private final FormSubmissionRepository formSubmissionRepository;
    private final FormInputRepository formInputRepository;
    private final FormTemplateRepository formTemplateRepository;
    private final FormValueRepository formValueRepository;

    public FormSubmissionService(FormSubmissionRepository formSubmissionRepository, FormInputRepository formInputRepository,
                                 FormTemplateRepository formTemplateRepository,
                                  FormValueRepository formValueRepository) {
        this.formSubmissionRepository = formSubmissionRepository;
        this.formInputRepository = formInputRepository;
        this.formTemplateRepository = formTemplateRepository;
        this.formValueRepository = formValueRepository;


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

    public FormSubmission updateFormSubmission(Long id, FormSubmission formSubmission) {
        if (formSubmissionRepository.existsById(id)) {
            formSubmission.setId(id);
            return formSubmissionRepository.save(formSubmission);
        } else {
            throw new IllegalArgumentException("FormSubmission with id " + id + " does not exist");
        }
    }
    public boolean existsByUserIdAndFormId(Long userId, Long formId) {
        return formSubmissionRepository.existsByUser_IdAndIdForm(userId, formId);
    }

    public List<FormSubmission> getFormSubmissionsByUserId(Long userId) {
        return formSubmissionRepository.findByUserId(userId);
    }


    private List<FormValueDTO> getFormValuesWithTitles(Long submissionId) {
        return formValueRepository.findByFormSubmissionId(submissionId).stream()
                .map(formValue -> {
                    FormInput formInput = formInputRepository.findByFormValue(formValue);
                    String title = formInput != null ? formInput.getTitle() : "Unknown";

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
