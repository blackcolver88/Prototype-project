package com.example.formservice.controller;

import com.example.formservice.DTO.FormInputRequest;
import com.example.formservice.DTO.FormLayoutOrderDTO;
import com.example.formservice.DTO.FormInputOrderDTO;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormLayout;
import com.example.formservice.entities.FormTemplate;
import com.example.formservice.exception.ResourceNotFoundException;
import com.example.formservice.service.FormTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/form-templates")
public class FormTemplateController {

    private final FormTemplateService formTemplateService;


    public FormTemplateController(FormTemplateService formTemplateService) {
        this.formTemplateService = formTemplateService;
    }

    @GetMapping
    public List<FormTemplate> getAllFormTemplates() {
        return formTemplateService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<FormTemplate> getFormTemplateById(@PathVariable Long id) {
        return formTemplateService.getFormTemplateById(id);
    }

    @PutMapping("/{id}")
    public FormTemplate updateFormLayout(@PathVariable Long id, @RequestBody FormTemplate formTemplate) {
        return formTemplateService.updateFormTemplate(id, formTemplate);
    }

    @PostMapping
    public FormTemplate createFormTemplate(@RequestBody FormTemplate formTemplate) {
        return formTemplateService.save(formTemplate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormTemplate(@PathVariable("id") Long id) {
        formTemplateService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/form-layouts")
    public ResponseEntity<FormTemplate> addFormLayoutsToFormTemplate(
            @PathVariable Long id,
            @RequestBody List<FormLayout> formLayouts) {
        FormTemplate updatedFormTemplate = formTemplateService.addFormLayoutsToFormTemplate(id, formLayouts);
        return ResponseEntity.ok(updatedFormTemplate);
    }

    @GetMapping("/{id}/form-layouts")
    public ResponseEntity<?> getFormLayoutsByFormTemplateId(@PathVariable Long id) {
        try {
            FormTemplate formTemplate = formTemplateService.getFormTemplateWithFormLayouts(id);
            return ResponseEntity.ok(formTemplate);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse() {
                @Override
                public HttpStatusCode getStatusCode() {
                    return null;
                }

                @Override
                public ProblemDetail getBody() {
                    return null;
                }
            });
        }
    }


    @PostMapping("/{templateId}/bulk-form-inputs")
    public ResponseEntity<List<FormInput>> addMultipleFormInputsToTemplate(
            @PathVariable Long templateId,
            @RequestBody List<FormInputRequest> formInputRequests) {
        List<FormInput> savedFormInputs = formTemplateService.addMultipleFormInputsToTemplate(templateId, formInputRequests);
        return ResponseEntity.ok(savedFormInputs);
    }
    @PostMapping("/{templateId}/form-inputs")
    public ResponseEntity<FormInput> addFormInputToTemplate(
            @PathVariable Long templateId,
            @RequestBody FormInput formInput) {
        FormInput savedFormInput = formTemplateService.addFormInputToTemplate(templateId, formInput);
        return ResponseEntity.ok(savedFormInput);
    }

    @GetMapping("/{templateId}/form-inputs")
    public ResponseEntity<List<FormInput>> getFormInputsByTemplateId(@PathVariable Long templateId) {
        List<FormInput> formInputs = formTemplateService.getFormInputsByTemplateId(templateId);
        return ResponseEntity.ok(formInputs);
    }

    @PutMapping("/{templateId}/form-layouts/order")
    public ResponseEntity<FormTemplate> updateFormLayoutsOrder(
            @PathVariable Long templateId,
            @RequestBody List<FormLayoutOrderDTO> layoutOrders) {
        FormTemplate updatedTemplate = formTemplateService.updateFormLayoutsOrder(templateId, layoutOrders);
        return ResponseEntity.ok(updatedTemplate);
    }

    @PutMapping("/{templateId}/form-inputs/order")
    public ResponseEntity<List<FormInput>> updateFormInputsOrder(
            @PathVariable Long templateId,
            @RequestBody List<FormInputOrderDTO> inputOrders) {
        List<FormInput> updatedInputs = formTemplateService.updateFormInputsOrder(templateId, inputOrders);
        return ResponseEntity.ok(updatedInputs);
    }

}

