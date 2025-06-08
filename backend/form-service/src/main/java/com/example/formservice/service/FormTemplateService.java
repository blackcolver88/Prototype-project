package com.example.formservice.service;

import com.example.formservice.DTO.*;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.entities.FormTemplateProcess;
import com.example.formservice.entities.enums.FormLayoutType;
import com.example.formservice.exception.ResourceNotFoundException;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormLayoutRepository;
import com.example.formservice.repository.FormTemplateRepository;
import com.example.formservice.repository.FormTemplateProcessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FormTemplateService {
    private final FormTemplateRepository formTemplateRepository;
    private final FormLayoutRepository formLayoutRepository;
    private final FormInputRepository formInputRepository;
    private final FormTemplateProcessRepository formTemplateProcessRepository;



    public FormTemplateService(FormTemplateRepository formTemplateRepository,
                               FormLayoutRepository formLayoutRepository,
                               FormInputRepository formInputRepository,
                               FormTemplateProcessRepository formTemplateProcessRepository) {
        this.formTemplateRepository = formTemplateRepository;
        this.formLayoutRepository = formLayoutRepository;
        this.formInputRepository = formInputRepository;
        this.formTemplateProcessRepository = formTemplateProcessRepository;


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
        formTemplate.getFormLayouts().sort((a, b) -> {
            Integer posA = a.getOrdinalPosition() != null ? a.getOrdinalPosition() : 0;
            Integer posB = b.getOrdinalPosition() != null ? b.getOrdinalPosition() : 0;
            if (posA.equals(posB)) {
                return a.getId().compareTo(b.getId());
            }
            return posA.compareTo(posB);
        });
        return formTemplate;
    }


    @Transactional
    public List<FormInput> addMultipleFormInputsToTemplate(Long templateId, List<FormInputRequest> formInputRequests) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        List<FormLayout> availableLayouts = formLayoutRepository.findByFormTemplateId(templateId);
        Map<Long, FormLayout> layoutMap = availableLayouts.stream()
                .collect(Collectors.toMap(FormLayout::getId, layout -> layout));

        List<FormInput> savedFormInputs = new ArrayList<>();

        for (FormInputRequest request : formInputRequests) {
            FormInput formInput = request.getFormInput();
            Long layoutId = request.getFormLayoutId();

            FormLayout formLayout;
            if (layoutId != null) {
                formLayout = layoutMap.get(layoutId);
                if (formLayout == null) {
                    throw new IllegalArgumentException("FormLayout not found with id: " + layoutId + " for template: " + templateId);
                }
            } else {
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

        FormLayout formLayout;
        if (formInput.getFormLayout() != null && formInput.getFormLayout().getId() != null) {
            formLayout = formLayoutRepository.findById(formInput.getFormLayout().getId())
                    .orElseThrow(() -> new IllegalArgumentException("FormLayout not found with id: " + formInput.getFormLayout().getId()));

            if (!formLayout.getFormTemplate().getId().equals(templateId)) {
                throw new IllegalArgumentException("FormLayout does not belong to the specified template");
            }
        } else {
            formLayout = formTemplate.getFormLayouts().stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No layouts found for template with id: " + templateId));
        }

        formInput.setFormLayout(formLayout);
        return formInputRepository.save(formInput);
    }

    @Transactional(readOnly = true)
    public List<FormInput> getFormInputsByTemplateId(Long templateId) {
        if (!formTemplateRepository.existsById(templateId)) {
            throw new IllegalArgumentException("FormTemplate not found with id: " + templateId);
        }

        List<FormLayout> topLevelLayouts = formLayoutRepository.findByFormTemplateIdAndParentIsNull(templateId);

        if (topLevelLayouts.isEmpty()) {
            return List.of();
        }

        List<FormInput> allFormInputs = new ArrayList<>();

        for (FormLayout layout : topLevelLayouts) {
            allFormInputs.addAll(formInputRepository.findByFormLayoutIdOrdered(layout.getId()));

            collectFormInputsRecursively(layout, allFormInputs);
        }

        return allFormInputs;
    }


    private void collectFormInputsRecursively(FormLayout layout, List<FormInput> allFormInputs) {
        for (FormLayout childLayout : layout.getChildren()) {
            allFormInputs.addAll(formInputRepository.findByFormLayoutIdOrdered(childLayout.getId()));

            collectFormInputsRecursively(childLayout, allFormInputs);
        }
    }

    @Transactional
    public FormTemplate updateFormLayoutsOrder(Long templateId, List<FormLayoutOrderDTO> layoutOrders) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        for (FormLayoutOrderDTO orderDTO : layoutOrders) {
            FormLayout layout = formLayoutRepository.findById(orderDTO.getId())
                    .orElseThrow(() -> new IllegalArgumentException("FormLayout not found with id: " + orderDTO.getId()));

            if (!layout.getFormTemplate().getId().equals(templateId)) {
                throw new IllegalArgumentException("FormLayout does not belong to the specified template");
            }

            layout.setOrdinalPosition(orderDTO.getOrdinalPosition());
            formLayoutRepository.save(layout);
        }

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
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        for (FormInputOrderDTO orderDTO : inputOrders) {
            FormInput input = formInputRepository.findById(orderDTO.getId())
                    .orElseThrow(() -> new IllegalArgumentException("FormInput not found with id: " + orderDTO.getId()));

            if (!input.getFormLayout().getFormTemplate().getId().equals(templateId)) {
                throw new IllegalArgumentException("FormInput does not belong to the specified template");
            }

            input.setOrdinalPosition(orderDTO.getOrdinalPosition());
            formInputRepository.save(input);
        }

        return getFormInputsByTemplateId(templateId);
    }

    public String getFormTemplateTitleById(Long idForm) {
        Optional<FormTemplate> formTemplate = formTemplateRepository.findById(idForm);
        return formTemplate.map(FormTemplate::getTitle).orElse("Formulaire inconnu");
    }

    @Transactional(readOnly = true)
    public List<FormLayout> getFormLayoutById(Long formTemplateId) {
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

    @Transactional
    public void updateSubsectionItemsOrder(Long templateId, Long subsectionId, List<FormInputOrderDTO> inputOrders) {
        FormLayout subsection = formLayoutRepository.findById(subsectionId)
                .orElseThrow(() -> new IllegalArgumentException("Sous-section non trouvée"));

        for (FormInputOrderDTO dto : inputOrders) {
            FormInput input = formInputRepository.findById(dto.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Champ non trouvé"));

            input.setOrdinalPosition(dto.getOrdinalPosition());
            formInputRepository.save(input);
        }
    }
    @Transactional
    public FormLayout updateSubsectionOrder(Long templateId, Long sectionId, List<SubsectionOrderDTO> subsectionOrders) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template non trouvé"));

        FormLayout section = formTemplate.getFormLayouts().stream()
                .filter(layout -> layout.getId().equals(sectionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Section non trouvée"));

        if (!"Section".equals(section.getType().name())) {
            throw new IllegalArgumentException("L'élément spécifié n'est pas une section");
        }

        for (SubsectionOrderDTO orderDTO : subsectionOrders) {
            FormLayout subsection = section.getChildren().stream()
                    .filter(s -> s.getId().equals(orderDTO.getId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Sous-section non trouvée"));

            subsection.setOrdinalPosition(orderDTO.getOrdinalPosition());
            formLayoutRepository.save(subsection);
        }

        section.getChildren().sort(Comparator.comparingInt(
                s -> s.getOrdinalPosition() != null ? s.getOrdinalPosition() : 0));

        return section;
    }

    // Process association methods
    @Transactional
    public ProcessAssociationResponse associateProcesses(Long templateId, ProcessAssociationRequest request) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        // Clear existing associations
        formTemplateProcessRepository.deleteByFormTemplateId(templateId);

        // Add new associations
        List<FormTemplateProcess> newAssociations = new ArrayList<>();
        for (ProcessAssociationRequest.ProcessInfo processInfo : request.getProcesses()) {
            FormTemplateProcess association = new FormTemplateProcess(
                    processInfo.getProcessDefinitionKey(),
                    processInfo.getProcessName(),
                    processInfo.getTargetRole(),
                    formTemplate
            );
            newAssociations.add(formTemplateProcessRepository.save(association));
        }

        return new ProcessAssociationResponse(templateId, newAssociations);
    }

    @Transactional(readOnly = true)
    public ProcessAssociationResponse getAssociatedProcesses(Long templateId) {
        if (!formTemplateRepository.existsById(templateId)) {
            throw new IllegalArgumentException("FormTemplate not found with id: " + templateId);
        }

        List<FormTemplateProcess> associations = formTemplateProcessRepository.findByFormTemplateId(templateId);
        return new ProcessAssociationResponse(templateId, associations);
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableProcessKeys(Long templateId) {
        if (!formTemplateRepository.existsById(templateId)) {
            throw new IllegalArgumentException("FormTemplate not found with id: " + templateId);
        }

        return formTemplateProcessRepository.findProcessDefinitionKeysByFormTemplateId(templateId);
    }

    /**
     * Lookup target role for a specific form template and process definition key
     * @param formTemplateId The form template ID
     * @param processDefinitionKey The process definition key
     * @return The target role if found, null otherwise
     */
    @Transactional(readOnly = true)
    public String getTargetRoleByFormTemplateAndProcess(Long formTemplateId, String processDefinitionKey) {
        Optional<String> targetRole = formTemplateProcessRepository.findTargetRoleByFormTemplateIdAndProcessDefinitionKey(formTemplateId, processDefinitionKey);
        return targetRole.orElse(null);
    }
}