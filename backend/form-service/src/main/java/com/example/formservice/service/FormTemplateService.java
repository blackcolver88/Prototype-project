package com.example.formservice.service;

import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormLayoutRepository;
import com.example.formservice.repository.FormTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FormTemplateService {
    private final FormTemplateRepository formTemplateRepository;
    private final FormLayoutRepository formLayoutRepository;
    private final FormInputRepository formInputRepository;



    public FormTemplateService(FormTemplateRepository formTemplateRepository,
                               FormLayoutRepository formLayoutRepository, FormInputRepository formInputRepository) {
        this.formTemplateRepository = formTemplateRepository;
        this.formLayoutRepository = formLayoutRepository;
        this.formInputRepository = formInputRepository;


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

    public FormInput addFormInputToTemplate(Long templateId, FormInput formInput) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found"));

        FormLayout formLayout = formTemplate.getFormLayouts().get(0);
        formInput.setFormLayout(formLayout);

        return formInputRepository.save(formInput);
    }

    public List<FormInput> getFormInputsByTemplateId(Long templateId) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found"));

        return formTemplate.getFormLayouts().stream()
                .flatMap(layout -> layout.getFormInputs().stream())
                .collect(Collectors.toList());
    }

}
