package com.example.formservice.repository;
import com.example.formservice.entities.FormInput;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.FormLayout;

import java.util.List;
import java.util.Optional;

public interface FormLayoutRepository extends JpaRepository<FormLayout, Long> {

    List<FormLayout> findByFormTemplateId(Long templateId);
    Optional<FormInput> findFormInputById(Long id);


}

