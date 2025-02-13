package com.example.formservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.FormTemplate;

public interface FormTemplateRepository extends JpaRepository<FormTemplate, Long> {
}

