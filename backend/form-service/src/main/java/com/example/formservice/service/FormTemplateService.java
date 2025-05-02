package com.example.formservice.service;

import com.example.formservice.DTO.FormInputRequest;
import com.example.formservice.DTO.FormLayoutDTO;
import com.example.formservice.DTO.FormLayoutOrderDTO;
import com.example.formservice.DTO.FormInputOrderDTO;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.entities.enums.FormLayoutType;
import com.example.formservice.exception.ResourceNotFoundException;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormLayoutRepository;
import com.example.formservice.repository.FormTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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
        Optional<FormTemplate> templateOptional = formTemplateRepository.findById(formTemplateId);

        if (templateOptional.isEmpty()) {
            throw new ResourceNotFoundException("FormTemplate with id " + formTemplateId + " not found");
        }

        FormTemplate formTemplate = templateOptional.get();

        List<FormLayout> allLayouts = formLayoutRepository.findByFormTemplateIdOrdered(formTemplateId);

        formTemplate.getFormLayouts().clear();
        formTemplate.getFormLayouts().addAll(
                allLayouts.stream()
                        .filter(layout -> layout.getParent() == null)
                        .sorted(Comparator.comparing(FormLayout::getOrdinalPosition, Comparator.nullsLast(Comparator.naturalOrder())))
                        .collect(Collectors.toList())
        );

        return formTemplate;
    }


    @Transactional
    public List<FormInput> addMultipleFormInputsToTemplate(Long templateId, List<FormInputRequest> formInputRequests) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        // Get all layouts for this template for validation
        List<FormLayout> availableLayouts = formLayoutRepository.findByFormTemplateId(templateId);
        Map<Long, FormLayout> layoutMap = availableLayouts.stream()
                .collect(Collectors.toMap(FormLayout::getId, layout -> layout));

        List<FormInput> savedFormInputs = new ArrayList<>();

        for (FormInputRequest request : formInputRequests) {
            FormInput formInput = request.getFormInput();
            Long layoutId = request.getFormLayoutId();

            // Find the layout
            FormLayout formLayout;
            if (layoutId != null) {
                formLayout = layoutMap.get(layoutId);
                if (formLayout == null) {
                    throw new IllegalArgumentException("FormLayout not found with id: " + layoutId + " for template: " + templateId);
                }
            } else {
                // Fallback to first layout if no layout specified
                formLayout = availableLayouts.stream()
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("No layouts found for template with id: " + templateId));
            }

            formInput.setFormLayout(formLayout);
            savedFormInputs.add(formInputRepository.save(formInput));
        }

        return savedFormInputs;
    }



    public FormInput addFormInputToTemplate(Long templateId, FormInput formInput) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        // Get the form layout by ID if provided, otherwise use the first layout
        FormLayout formLayout;
        if (formInput.getFormLayout() != null && formInput.getFormLayout().getId() != null) {
            formLayout = formLayoutRepository.findById(formInput.getFormLayout().getId())
                    .orElseThrow(() -> new IllegalArgumentException("FormLayout not found with id: " + formInput.getFormLayout().getId()));

            // Verify layout belongs to the template
            if (!formLayout.getFormTemplate().getId().equals(templateId)) {
                throw new IllegalArgumentException("FormLayout does not belong to the specified template");
            }
        } else {
            // Fallback to first layout
            formLayout = formTemplate.getFormLayouts().stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No layouts found for template with id: " + templateId));
        }

        formInput.setFormLayout(formLayout);
        return formInputRepository.save(formInput);
    }

    @Transactional(readOnly = true)
    public List<FormInput> getFormInputsByTemplateId(Long templateId) {
        // Check if template exists
        if (!formTemplateRepository.existsById(templateId)) {
            throw new IllegalArgumentException("FormTemplate not found with id: " + templateId);
        }

        // Get all layouts for the template
        List<FormLayout> layouts = formLayoutRepository.findByFormTemplateId(templateId);

        if (layouts.isEmpty()) {
            return List.of(); // Return empty list if no layouts found
        }

        // Collect all form inputs from all layouts in the correct order
        return layouts.stream()
                .flatMap(layout -> formInputRepository.findByFormLayoutIdOrdered(layout.getId()).stream())
                .collect(Collectors.toList());
    }

    @Transactional
    public FormTemplate updateFormLayoutsOrder(Long templateId, List<FormLayoutOrderDTO> layoutOrders) {
        // Check if template exists
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        // Update the ordinal position for each layout
        for (FormLayoutOrderDTO orderDTO : layoutOrders) {
            FormLayout layout = formLayoutRepository.findById(orderDTO.getId())
                    .orElseThrow(() -> new IllegalArgumentException("FormLayout not found with id: " + orderDTO.getId()));
            
            // Verify the layout belongs to this template
            if (!layout.getFormTemplate().getId().equals(templateId)) {
                throw new IllegalArgumentException("FormLayout does not belong to the specified template");
            }
            
            // Set the ordinal position
            layout.setOrdinalPosition(orderDTO.getOrdinalPosition());
            formLayoutRepository.save(layout);
        }
        
        // Sort the template's layouts in memory before returning
        FormTemplate result = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found"));
        
        result.getFormLayouts().sort((a, b) -> {
            Integer posA = a.getOrdinalPosition() != null ? a.getOrdinalPosition() : 0;
            Integer posB = b.getOrdinalPosition() != null ? b.getOrdinalPosition() : 0;
            if (posA.equals(posB)) {
                return a.getId().compareTo(b.getId());
            }
            return posA.compareTo(posB);
        });
        
        return result;
    }

    @Transactional
    public List<FormInput> updateFormInputsOrder(Long templateId, List<FormInputOrderDTO> inputOrders) {
        // Check if template exists
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        // Update the ordinal position for each input
        for (FormInputOrderDTO orderDTO : inputOrders) {
            FormInput input = formInputRepository.findById(orderDTO.getId())
                    .orElseThrow(() -> new IllegalArgumentException("FormInput not found with id: " + orderDTO.getId()));
            
            // Verify the input belongs to the correct layout
            if (!input.getFormLayout().getFormTemplate().getId().equals(templateId)) {
                throw new IllegalArgumentException("FormInput does not belong to the specified template");
            }
            
            // Set the ordinal position
            input.setOrdinalPosition(orderDTO.getOrdinalPosition());
            formInputRepository.save(input);
        }
        
        // Return all updated inputs for this template
        return getFormInputsByTemplateId(templateId);
    }

    public String getFormTemplateTitleById(Long idForm) {
        Optional<FormTemplate> formTemplate = formTemplateRepository.findById(idForm);
        return formTemplate.map(FormTemplate::getTitle).orElse("Formulaire inconnu");
    }

    @Transactional(readOnly = true)
    public List<FormLayout> getFormLayoutById(Long formTemplateId) {
    // This returns layouts for a specific form template
    return formLayoutRepository.findByFormTemplateId(formTemplateId);
    }

    @Transactional
    public FormLayout addSubsectionToSection(Long sectionId, FormLayout subsection) {
        FormLayout section = formLayoutRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));

        // Verify the parent is a Section
        if (section.getType() != FormLayoutType.Section) {
            throw new IllegalArgumentException("Parent layout must be of type Section");
        }

        subsection.setType(FormLayoutType.Subsection);
        subsection.setParent(section);
        subsection.setFormTemplate(section.getFormTemplate());

        int newPosition = section.getChildren().size();
        subsection.setOrdinalPosition(newPosition);

        FormLayout savedSubsection = formLayoutRepository.save(subsection);

        section.getChildren().add(savedSubsection);
        formLayoutRepository.save(section);

        return savedSubsection;
    }

    private FormLayoutDTO mapToDTO(FormLayout formLayout) {
        FormLayoutDTO dto = new FormLayoutDTO();
        dto.setId(formLayout.getId());
        dto.setTitle(formLayout.getTitle());
        dto.setType(formLayout.getType());
        dto.setOrdinalPosition(formLayout.getOrdinalPosition());
        dto.setParentId(formLayout.getParent() != null ? formLayout.getParent().getId() : null);

        if (formLayout.getChildren() != null) {
            dto.setChildren(formLayout.getChildren().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    @Transactional
    public List<FormLayout> getSubsectionsBySection(Long sectionId) {
        FormLayout section = formLayoutRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));

        if (section.getType() != FormLayoutType.Section) {
            throw new IllegalArgumentException("Specified layout is not a Section");
        }

        return section.getChildren().stream()
                .sorted(Comparator.comparing(FormLayout::getOrdinalPosition))
                .collect(Collectors.toList());
    }

    @Transactional
    public FormLayout updateSubsectionOrder(Long sectionId, List<FormLayoutOrderDTO> subsectionOrders) {
        FormLayout section = formLayoutRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));

        Map<Long, FormLayout> childrenMap = section.getChildren().stream()
                .collect(Collectors.toMap(FormLayout::getId, child -> child));

        for (FormLayoutOrderDTO orderDTO : subsectionOrders) {
            FormLayout subsection = childrenMap.get(orderDTO.getId());
            if (subsection != null) {
                subsection.setOrdinalPosition(orderDTO.getOrdinalPosition());
                formLayoutRepository.save(subsection);
            }
        }

        return formLayoutRepository.findById(sectionId).orElseThrow();
    }
    @Transactional
    public FormLayout addSectionToFormTemplate(Long formTemplateId, FormLayout section) {
        FormTemplate formTemplate = formTemplateRepository.findById(formTemplateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + formTemplateId));

        section.setType(FormLayoutType.Section);
        section.setFormTemplate(formTemplate);

        int newPosition = formTemplate.getFormLayouts().size();
        section.setOrdinalPosition(newPosition);

        FormLayout savedSection = formLayoutRepository.save(section);
        formTemplate.getFormLayouts().add(savedSection);
        formTemplateRepository.save(formTemplate);

        return savedSection;
    }
    @Transactional
    public FormInput addFormInputToSectionOrSubsection(Long layoutId, FormInput formInput) {
        FormLayout layout = formLayoutRepository.findById(layoutId)
                .orElseThrow(() -> new IllegalArgumentException("FormLayout not found with id: " + layoutId));

        formInput.setFormLayout(layout);

        int newPosition = layout.getFormInputs().size();
        formInput.setOrdinalPosition(newPosition);

        FormInput savedFormInput = formInputRepository.save(formInput);
        layout.getFormInputs().add(savedFormInput);
        formLayoutRepository.save(layout);

        return savedFormInput;
    }

    @Transactional(readOnly = true)
    public FormTemplate getFullFormTemplate(Long formTemplateId) {
        FormTemplate formTemplate = formTemplateRepository.findById(formTemplateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + formTemplateId));

        List<FormLayout> sections = formLayoutRepository.findByFormTemplateIdAndParentIsNullOrdered(formTemplateId);

        for (FormLayout section : sections) {
            loadSubsectionsAndInputs(section);
        }

        formTemplate.getFormLayouts().clear();
        formTemplate.getFormLayouts().addAll(sections);

        return formTemplate;
    }

    private void loadSubsectionsAndInputs(FormLayout layout) {
        List<FormLayout> subsections = formLayoutRepository.findByParentIdOrdered(layout.getId());
        layout.setChildren(subsections);

        for (FormLayout subsection : subsections) {
            loadSubsectionsAndInputs(subsection); 
        }

        List<FormInput> formInputs = formInputRepository.findByFormLayoutIdOrdered(layout.getId());
        layout.setFormInputs(formInputs);
    }
}
