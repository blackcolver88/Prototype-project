package com.example.formservice.service;

import com.example.formservice.DTO.FormInputRequest;
import com.example.formservice.DTO.FormLayoutOrderDTO;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.FormLayoutRepository;
import com.example.formservice.repository.FormTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
        FormTemplate formTemplate = formTemplateRepository.findById(formTemplateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found"));
        
        // Get ordered layouts without replacing the collection
        List<FormLayout> orderedLayouts = formLayoutRepository.findByFormTemplateIdOrderByOrdinalPositionAsc(formTemplateId);
        
        // Don't directly set the layouts collection, instead set them in a DTO or manually sort them
        // This example returns the template with its original collection for safety
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

        // Collect all form inputs from all layouts
        return layouts.stream()
                .flatMap(layout -> formInputRepository.findByFormLayoutId(layout.getId()).stream())
                .collect(Collectors.toList());
    }

    @Transactional
    public FormTemplate updateFormLayoutsOrder(Long templateId, List<FormLayoutOrderDTO> layoutOrders) {
        FormTemplate formTemplate = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found with id: " + templateId));

        // Update the ordinal position for each layout without changing the collection reference
        for (FormLayoutOrderDTO orderDTO : layoutOrders) {
            FormLayout layout = formLayoutRepository.findById(orderDTO.getId())
                    .orElseThrow(() -> new IllegalArgumentException("FormLayout not found with id: " + orderDTO.getId()));
            
            // Set the ordinal position
            layout.setOrdinalPosition(orderDTO.getOrdinalPosition());
            formLayoutRepository.save(layout);
        }

        // Return the template with layouts in order without replacing the collection
        List<FormLayout> orderedLayouts = formLayoutRepository.findByFormTemplateIdOrderByOrdinalPositionAsc(templateId);
        
        // Don't replace the collection, instead return a refreshed template
        return formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("FormTemplate not found"));
    }
}
