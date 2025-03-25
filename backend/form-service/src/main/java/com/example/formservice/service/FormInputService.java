package com.example.formservice.service;
import com.example.formservice.DTO.FormInputWithValues;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormValue;
import com.example.formservice.repository.FormInputRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class FormInputService {
    private final FormInputRepository formInputRepository;
    private final FormValueService formValueService;

    public FormInputService(FormInputRepository formInputRepository, FormValueService formValueService) {
        this.formInputRepository = formInputRepository;
        this.formValueService = formValueService;
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

    public FormInput updateFormInput(Long id, FormInput formInput) {
        if (formInputRepository.existsById(id)) {
            formInput.setId(id);
            return formInputRepository.save(formInput);
        } else {
            throw new IllegalArgumentException("FormInput with id " + id + " does not exist");
        }
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

}
