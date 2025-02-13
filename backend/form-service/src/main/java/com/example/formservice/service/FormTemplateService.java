package com.example.formservice.service;

import com.example.formservice.entities.FormTemplate;
import com.example.formservice.repository.FormTemplateRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FormTemplateService {
    private final FormTemplateRepository formTemplateRepository;

    public FormTemplateService(FormTemplateRepository formTemplateRepository) {
        this.formTemplateRepository = formTemplateRepository;
    }

    public Optional<FormTemplate> getFormTemplateById(Long id) {
        return formTemplateRepository.findById(id);
    }

    public List<FormTemplate> findAll() {
        return formTemplateRepository.findAll();
    }

    public FormTemplate save(FormTemplate formTemplate) {
        return formTemplateRepository.save(formTemplate);
    }

    public void deleteById(Long id) {
        formTemplateRepository.deleteById(id);
    }

    public FormTemplate updateFormTemplate(Long id, FormTemplate formTemplate) {
        if (formTemplateRepository.existsById(id)) {
            formTemplate.setId(id);
            return formTemplateRepository.save(formTemplate);
        } else {
            throw new IllegalArgumentException("FormTemplate with id " + id + " does not exist");
        }
    }

}
