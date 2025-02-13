package com.example.formservice.controller;

import com.example.formservice.entities.FormLayout;
import com.example.formservice.service.FormLayoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/form-layouts")
@CrossOrigin("*")
public class FormLayoutController {

    private final FormLayoutService formLayoutService;

    public FormLayoutController(FormLayoutService formLayoutService) {
        this.formLayoutService = formLayoutService;
    }

    @GetMapping
    public List<FormLayout> getAllFormLayouts() {
        return formLayoutService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<FormLayout> getFormLayoutById(@PathVariable Long id) {
        return formLayoutService.getFormLayoutById(id);
    }

    @PostMapping
    public FormLayout createFormLayout(@RequestBody FormLayout formLayout) {
        return formLayoutService.save(formLayout);
    }

    @PutMapping("/{id}")
    public FormLayout updateFormLayout(@PathVariable Long id, @RequestBody FormLayout formLayout) {
        return formLayoutService.updateFormLayout(id, formLayout);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormLayout(@PathVariable Long id) {
        formLayoutService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
