package com.example.formservice.service;

import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.repository.FormLayoutRepository;
import com.example.formservice.repository.FormTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FormTemplateService {
    private final FormTemplateRepository formTemplateRepository;
    private final FormLayoutRepository formLayoutRepository;


    public FormTemplateService(FormTemplateRepository formTemplateRepository,
                               FormLayoutRepository formLayoutRepository) {
        this.formTemplateRepository = formTemplateRepository;
        this.formLayoutRepository = formLayoutRepository;

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
    public FormTemplate addFormLayoutsToFormTemplate(Long formTemplateId, List<FormLayout> formLayouts) {

        FormTemplate formTemplate = formTemplateRepository.findById(formTemplateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found"));

        for (FormLayout formLayout : formLayouts) {
            formLayout.setFormTemplate(formTemplate);
            formTemplate.getFormLayouts().add(formLayout);
        }

        return formTemplateRepository.save(formTemplate);
    }

    public FormTemplate getFormTemplateWithFormLayouts(Long formTemplateId) {
        return formTemplateRepository.findById(formTemplateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found"));
    }

}
