package com.example.formservice.service;

import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.repository.FormLayoutRepository;
import com.example.formservice.repository.FormTemplateRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FormLayoutService {
    private final FormLayoutRepository formLayoutRepository;
    private final FormTemplateRepository formTemplateRepository;


    public FormLayoutService(FormLayoutRepository formLayoutRepository, FormTemplateRepository formTemplateRepository) {
        this.formLayoutRepository = formLayoutRepository;
        this.formTemplateRepository = formTemplateRepository;

    }

    public List<FormLayout> findAll() {
        return formLayoutRepository.findAll();
    }

    public Optional<FormLayout> getFormLayoutById(Long id) {
        return formLayoutRepository.findById(id);
    }

    public FormLayout save(FormLayout formLayout) {
        return formLayoutRepository.save(formLayout);
    }

    public void deleteById(Long id) {
        formLayoutRepository.deleteById(id);
    }

    public FormLayout updateFormLayout(Long id, FormLayout formLayout) {
        if (formLayoutRepository.existsById(id)) {
            formLayout.setId(id);
            return formLayoutRepository.save(formLayout);
        } else {
            throw new IllegalArgumentException("FormLayout with id " + id + " does not exist");
        }
    }

    public FormLayout addSubsectionToSection(Long sectionId, FormLayout subsection) {
        Optional<FormLayout> sectionOpt = formLayoutRepository.findById(sectionId);
        if (sectionOpt.isPresent()) {
            FormLayout section = sectionOpt.get();
            if (section.getChildren() == null) {
                section.setChildren(new ArrayList<>());
            }
            subsection.setParent(section);
            FormLayout savedSubsection = formLayoutRepository.save(subsection);
            section.getChildren().add(savedSubsection);
            formLayoutRepository.save(section);
            return savedSubsection;
        } else {
            throw new IllegalArgumentException("Section with id " + sectionId + " does not exist");
        }
    }

    
}