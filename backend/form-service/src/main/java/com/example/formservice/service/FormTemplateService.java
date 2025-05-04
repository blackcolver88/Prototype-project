package com.example.formservice.service;

import com.example.formservice.DTO.FormInputRequest;
import com.example.formservice.DTO.FormLayoutOrderDTO;
import com.example.formservice.DTO.FormInputOrderDTO;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.exception.ResourceNotFoundException;
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
        Optional<FormTemplate> templateOptional = formTemplateRepository.findById(formTemplateId);

        if (templateOptional.isEmpty()) {
            throw new ResourceNotFoundException("FormTemplate with id " + formTemplateId + " not found");
        }

        FormTemplate formTemplate = templateOptional.get();

        List<FormLayout> orderedLayouts = formLayoutRepository.findByFormTemplateIdOrdered(formTemplateId);

        
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

        List<FormLayout> layouts = formLayoutRepository.findByFormTemplateId(templateId);

        if (layouts.isEmpty()) {
            return List.of(); 
        }

        return layouts.stream()
                .flatMap(layout -> formInputRepository.findByFormLayoutIdOrdered(layout.getId()).stream())
                .collect(Collectors.toList());
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
}
