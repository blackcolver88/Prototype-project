package com.example.formservice.controller;

import com.example.formservice.DTO.MultipleValueDTO;
import com.example.formservice.entities.MultipleValue;
import com.example.formservice.service.MultipleValueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/multiple-values")
public class MultipleValueController {
    @Autowired
    private MultipleValueService multipleValueService;

    @PostMapping
    public ResponseEntity<MultipleValue> createMultipleValue(@RequestBody MultipleValue multipleValue) {
        MultipleValue savedMultipleValue = multipleValueService.saveMultipleValue(multipleValue);
        return ResponseEntity.ok(savedMultipleValue);
    }

    @GetMapping("/form-input/{formInputId}")
    public ResponseEntity<List<MultipleValue>> getMultipleValuesByFormInputId(@PathVariable Long formInputId) {
        List<MultipleValue> multipleValues = multipleValueService.getMultipleValuesByFormInputId(formInputId);
        return ResponseEntity.ok(multipleValues);
    }

    @GetMapping
    public ResponseEntity<List<MultipleValue>> getAllMultipleValues() {
        List<MultipleValue> multipleValues = multipleValueService.getAllMultipleValues();
        return ResponseEntity.ok(multipleValues);
    }
}