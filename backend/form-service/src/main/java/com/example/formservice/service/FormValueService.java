package com.example.formservice.service;

import com.example.formservice.entities.FormValue;
import com.example.formservice.repository.FormValueRepository;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FormValueService {
    private final FormValueRepository formValueRepository;

    public FormValueService(FormValueRepository formValueRepository) {
        this.formValueRepository = formValueRepository;
    }

    public FormValue save(FormValue formValue) {
        return formValueRepository.save(formValue);
    }

    public List<FormValue> saveAll(List<FormValue> formValues) {
        return formValueRepository.saveAll(formValues);
    }

    public List<FormValue> getFormValuesBySubmissionId(Long submissionId) {
        return formValueRepository.findByFormSubmissionId(submissionId);
    }

    @Transactional(readOnly = true)
    public List<FormValue> findFormValuesByFormInputId(Long formInputId) {
        // Find all FormValues that reference the given FormInput
        // This requires a custom query using JPQL join
        return formValueRepository.findByFormInputsId(formInputId);
    }

    @Transactional
    public void deleteFormValue(Long id) {
        formValueRepository.deleteById(id);
    }

    @Transactional
    public FormValue saveFormValue(FormValue formValue) {
        return formValueRepository.save(formValue);
    }
}
