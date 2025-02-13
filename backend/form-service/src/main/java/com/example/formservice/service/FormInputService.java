package com.example.formservice.service;
import com.example.formservice.entities.FormInput;
import com.example.formservice.repository.FormInputRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class FormInputService {
    private final FormInputRepository formInputRepository;

    public FormInputService(FormInputRepository formInputRepository) {
        this.formInputRepository = formInputRepository;
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
}
