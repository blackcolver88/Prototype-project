package com.example.formservice.service;

import com.example.formservice.entities.FormSubmission;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormSubmissionRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FormSubmissionService {
    private final FormSubmissionRepository formSubmissionRepository;
    private final FormInputRepository formInputRepository;

    public FormSubmissionService(FormSubmissionRepository formSubmissionRepository, FormInputRepository formInputRepository) {
        this.formSubmissionRepository = formSubmissionRepository;
        this.formInputRepository = formInputRepository;
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

    public List<FormSubmission> getFormSubmissionsByUserAndForm(Long userId, Long formId) {
        return formSubmissionRepository.findByUserIdAndFormId(userId, formId);
    }

    public List<FormSubmission> getFormSubmissionsByUserId(Long userId) {
        return formSubmissionRepository.findByUserId(userId);
    }


}
