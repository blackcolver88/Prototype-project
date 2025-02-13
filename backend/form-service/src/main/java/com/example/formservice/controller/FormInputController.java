package com.example.formservice.controller;

import com.example.formservice.entities.FormInput;
import com.example.formservice.service.FormInputService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/form-inputs")
public class FormInputController {

    private final FormInputService formInputService;

    public FormInputController(FormInputService formInputService) {
        this.formInputService = formInputService;
    }

    @GetMapping
    public List<FormInput> getAllFormInputs() {
        return formInputService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<FormInput> getFormInputById(@PathVariable Long id) {
        return formInputService.getFormInputById(id);
    }

    @PostMapping
    public FormInput createFormInput(@RequestBody FormInput formInput) {
        return formInputService.save(formInput);
    }

    @PutMapping("/{id}")
    public FormInput updateFormInput(@PathVariable Long id, @RequestBody FormInput formInput) {
        return formInputService.updateFormInput(id, formInput);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormInput(@PathVariable Long id) {
        formInputService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
