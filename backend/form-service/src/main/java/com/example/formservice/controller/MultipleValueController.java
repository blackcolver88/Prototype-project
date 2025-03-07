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
    public ResponseEntity<MultipleValueDTO> createMultipleValue(@RequestBody MultipleValue multipleValue) {
        MultipleValue savedMultipleValue = multipleValueService.saveMultipleValue(multipleValue);
        MultipleValueDTO responseDTO = mapToDTO(savedMultipleValue);
        return ResponseEntity.ok(responseDTO);
    }

    private MultipleValueDTO mapToDTO(MultipleValue entity) {
        MultipleValueDTO dto = new MultipleValueDTO();
        dto.setId(entity.getId());
        dto.setValeurs(entity.getValeurs());
        dto.setFormInputId(entity.getFormInput() != null ? entity.getFormInput().getId() : null);
        return dto;
    }

    @GetMapping("/form-input/{formInputId}")
    public ResponseEntity<List<MultipleValueDTO>> getMultipleValuesByFormInputId(@PathVariable Long formInputId) {
        List<MultipleValue> multipleValues = multipleValueService.getMultipleValuesByFormInputId(formInputId);
        List<MultipleValueDTO> dtos = multipleValues.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }



    @GetMapping
    public ResponseEntity<List<MultipleValue>> getAllMultipleValues() {
        List<MultipleValue> multipleValues = multipleValueService.getAllMultipleValues();
        return ResponseEntity.ok(multipleValues);
    }
}