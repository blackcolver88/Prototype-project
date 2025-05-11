package com.example.formservice.service;

import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.enums.FormLayoutType;
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

    public FormLayout updateFormLayout(Long id, FormLayout formLayoutDetails) {
        return formLayoutRepository.findById(id)
                .map(formLayout -> {
                    if (formLayoutDetails.getTitle() != null && !formLayoutDetails.getTitle().trim().isEmpty()) {
                        formLayout.setTitle(formLayoutDetails.getTitle());
                    } else {
                        throw new IllegalArgumentException("Title cannot be null or empty");
                    }

                    if (formLayoutDetails.getType() != null) {
                        formLayout.setType(formLayoutDetails.getType());
                    }

                    if (formLayoutDetails.getOrdinalPosition() != null) {
                        formLayout.setOrdinalPosition(formLayoutDetails.getOrdinalPosition());
                    }

                    return formLayoutRepository.save(formLayout);
                }).orElseThrow(() -> new IllegalArgumentException("FormLayout with id " + id + " does not exist"));
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

    public void deleteSubsectionById(Long id) {
        FormLayout layout = formLayoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FormLayout non trouvé avec l'id " + id));

        if (layout.getType() != FormLayoutType.Subsection) {
            throw new RuntimeException("L'élément avec l'id " + id + " n'est pas une Subsection.");
        }

        formLayoutRepository.deleteById(id);
    }

    
}