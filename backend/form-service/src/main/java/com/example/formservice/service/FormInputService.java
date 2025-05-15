package com.example.formservice.service;
import com.example.formservice.DTO.FormInputUpdateDTO;
import com.example.formservice.DTO.FormInputWithValues;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormValue;
import com.example.formservice.entities.MultipleValue;
import com.example.formservice.entities.enums.FormInputType;
import com.example.formservice.exception.ResourceNotFoundException;
import com.example.formservice.repository.FormInputRepository;

import java.util.*;
import java.util.stream.Collectors;

import com.example.formservice.repository.FormLayoutRepository;
import com.example.formservice.repository.FormValueRepository;
import com.example.formservice.repository.MultipleValueRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class FormInputService {
    private final FormInputRepository formInputRepository;
    private final FormValueService formValueService;
    private final FormLayoutRepository formLayoutRepository;
    private final FormValueRepository formValueRepository;
    private final MultipleValueRepository multipleValueRepository;


    public FormInputService(FormInputRepository formInputRepository, FormValueService formValueService,
                            FormLayoutRepository formLayoutRepository, FormValueRepository formValueRepository ,
                            MultipleValueRepository multipleValueRepository) {
        this.formInputRepository = formInputRepository;
        this.formValueService = formValueService;
        this.formLayoutRepository = formLayoutRepository;
        this.formValueRepository = formValueRepository;
        this.multipleValueRepository = multipleValueRepository;
    }

    public List<FormInput> findAll() {
        return formInputRepository.findAll();
    }

    public Optional<FormInput> getFormInputById(Long id) {
        return formInputRepository.findById(id);
    }

    public FormInput save(FormInput formInput) {
        return formInputRepository.save(formInput);
    }

    public void deleteById(Long id) {
        formInputRepository.deleteById(id);
    }

    public FormInput updateFormInput(Long id, FormInputUpdateDTO formInputUpdateDTO) {
        FormInput existing = formInputRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FormInput not found with id " + id));

        if (formInputUpdateDTO.getTitle() != null) {
            existing.setTitle(formInputUpdateDTO.getTitle());
        }

        if (formInputUpdateDTO.getType() != null) {
            existing.setType(formInputUpdateDTO.getType());
        }

        existing.setRequired(formInputUpdateDTO.isRequired());

        if (formInputUpdateDTO.getOrdinalPosition() != null) {
            existing.setOrdinalPosition(formInputUpdateDTO.getOrdinalPosition());
        }

        if (formInputUpdateDTO.getFormLayoutId() != null) {
            FormLayout formLayout = formLayoutRepository.findById(formInputUpdateDTO.getFormLayoutId())
                    .orElseThrow(() -> new ResourceNotFoundException("FormLayout not found"));
            existing.setFormLayout(formLayout);
        }

       
    /*
    if (formInputUpdateDTO.getFormValueId() != null) {
        FormValue formValue = formValueRepository.findById(formInputUpdateDTO.getFormValueId())
                .orElseThrow(() -> new ResourceNotFoundException("FormValue not found"));
        existing.setFormValue(formValue);
    }
    */

        if (isMultipleValueType(existing.getType())) {
            List<String> multipleValuesDTO = formInputUpdateDTO.getMultipleValues();

            if (multipleValuesDTO != null) {
                if (existing.getMultipleValues() != null) {
                    List<MultipleValue> toRemove = new ArrayList<>(existing.getMultipleValues());
                    existing.getMultipleValues().clear();

                    for (MultipleValue mv : toRemove) {
                        multipleValueRepository.delete(mv);
                    }
                } else {
                    existing.setMultipleValues(new ArrayList<>());
                }

                for (String value : multipleValuesDTO) {
                    if (value != null && !value.trim().isEmpty()) {
                        MultipleValue multipleValue = new MultipleValue();
                        multipleValue.setValeurs(List.of(value));
                        multipleValue.setFormInput(existing);
                        existing.getMultipleValues().add(multipleValue);
                    }
                }
            }
        }

        return formInputRepository.save(existing);
    }
    private boolean isMultipleValueType(FormInputType type) {
        return type == FormInputType.SELECT_BOX ||
                type == FormInputType.RADIO_BUTTON ||
                type == FormInputType.CHECKBOX;
    }

    public List<FormInputWithValues> getFormInputsWithValuesByFormId(Long formId) {
        List<FormInput> formInputs = formInputRepository.findByFormLayoutFormId(formId);

        return formInputs.stream()
                .map(formInput -> {
                    Long inputId = formInput.getId();
                    String title = formInput.getTitle();

                    List<FormValue> formValues = formValueService.getFormValuesBySubmissionId(inputId);

                    return new FormInputWithValues(title, formValues);
                })
                .collect(Collectors.toList());
    }

    public String getFormInputTitleById(Long formInputId) {
        Optional<String> titleOptional = formInputRepository.findTitleById(formInputId);
        return titleOptional.orElse("N/A");
    }





}
