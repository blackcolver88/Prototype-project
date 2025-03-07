package com.example.formservice.service;

import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.MultipleValue;
import com.example.formservice.repository.FormInputRepository;
import com.example.formservice.repository.MultipleValueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MultipleValueService {
    @Autowired
    private MultipleValueRepository multipleValueRepository;

    @Autowired
    private FormInputRepository formInputRepository;

    public MultipleValue saveMultipleValue(MultipleValue multipleValue) {
        if (multipleValue.getFormInput() != null && multipleValue.getFormInput().getId() != null) {
            Long formInputId = multipleValue.getFormInput().getId();
            FormInput formInput = formInputRepository.findById(formInputId)
                    .orElseThrow(() -> new EntityNotFoundException("FormInput not found with id: " + formInputId));
            multipleValue.setFormInput(formInput);
        }

        return multipleValueRepository.save(multipleValue);
    }

    public List<MultipleValue> getMultipleValuesByFormInputId(Long formInputId) {
        return multipleValueRepository.findByFormInputId(formInputId);
    }

    public List<MultipleValue> getAllMultipleValues() {
        return multipleValueRepository.findAll();
    }
}
