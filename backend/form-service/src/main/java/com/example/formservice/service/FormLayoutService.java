package com.example.formservice.service;

import com.example.formservice.entities.FormLayout;
import com.example.formservice.repository.FormLayoutRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FormLayoutService {
    private final FormLayoutRepository formLayoutRepository;

    public FormLayoutService(FormLayoutRepository formLayoutRepository) {
        this.formLayoutRepository = formLayoutRepository;
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
}