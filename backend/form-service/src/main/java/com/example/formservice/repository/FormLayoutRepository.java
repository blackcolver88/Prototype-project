package com.example.formservice.repository;
import com.example.formservice.entities.FormInput;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.FormLayout;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FormLayoutRepository extends JpaRepository<FormLayout, Long> {

    List<FormLayout> findByFormTemplateId(Long templateId);
    Optional<FormInput> findFormInputById(Long id);
    List<FormLayout> findByFormTemplateIdOrderByOrdinalPositionAsc(Long templateId);

    @Query("SELECT fl FROM FormLayout fl WHERE fl.formTemplate.id = :templateId ORDER BY COALESCE(fl.ordinalPosition, 0), fl.id")
    List<FormLayout> findByFormTemplateIdOrdered(@Param("templateId") Long templateId);

}

