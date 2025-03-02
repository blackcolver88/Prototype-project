package com.example.formservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.FormLayout;

import java.util.List;

public interface FormLayoutRepository extends JpaRepository<FormLayout, Long> {

    List<FormLayout> findByFormTemplateId(Long templateId);

}

