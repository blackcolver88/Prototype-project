package com.example.formservice.service;

import com.example.formservice.entities.MultipleValue;
import com.example.formservice.repository.MultipleValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MultipleValueService {
    @Autowired
    private MultipleValueRepository multipleValueRepository;

    public MultipleValue saveMultipleValue(MultipleValue multipleValue) {
        return multipleValueRepository.save(multipleValue);
    }

    public List<MultipleValue> getMultipleValuesByFormInputId(Long formInputId) {
        return multipleValueRepository.findByFormInputId(formInputId);
    }

    public List<MultipleValue> getAllMultipleValues() {
        return multipleValueRepository.findAll();
    }
}
