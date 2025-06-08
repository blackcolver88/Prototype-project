package com.example.formservice;

import com.example.formservice.entities.FormTemplate;
import com.example.formservice.entities.FormTemplateProcess;
import com.example.formservice.repository.FormTemplateProcessRepository;
import com.example.formservice.service.FormTemplateService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class FormTemplateServiceTest {

    @Mock
    private FormTemplateProcessRepository formTemplateProcessRepository;

    @InjectMocks
    private FormTemplateService formTemplateService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetTargetRoleByFormTemplateAndProcess_Success() {
        // Arrange
        Long formId = 1L;
        String processDefinitionKey = "form-submission-process";
        String expectedRole = "manager";

        when(formTemplateProcessRepository.findTargetRoleByFormTemplateIdAndProcessDefinitionKey(formId, processDefinitionKey))
                .thenReturn(Optional.of(expectedRole));

        // Act
        String actualRole = formTemplateService.getTargetRoleByFormTemplateAndProcess(formId, processDefinitionKey);

        // Assert
        assertEquals(expectedRole, actualRole);
        verify(formTemplateProcessRepository, times(1))
                .findTargetRoleByFormTemplateIdAndProcessDefinitionKey(formId, processDefinitionKey);
    }

    @Test
    void testGetTargetRoleByFormTemplateAndProcess_NotFound() {
        // Arrange
        Long formId = 1L;
        String processDefinitionKey = "non-existent-process";

        when(formTemplateProcessRepository.findTargetRoleByFormTemplateIdAndProcessDefinitionKey(formId, processDefinitionKey))
                .thenReturn(Optional.empty());

        // Act
        String actualRole = formTemplateService.getTargetRoleByFormTemplateAndProcess(formId, processDefinitionKey);

        // Assert
        assertNull(actualRole);
        verify(formTemplateProcessRepository, times(1))
                .findTargetRoleByFormTemplateIdAndProcessDefinitionKey(formId, processDefinitionKey);
    }
}
