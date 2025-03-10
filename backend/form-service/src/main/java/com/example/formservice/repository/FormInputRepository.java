package com.example.formservice.repository;
import com.example.formservice.entities.FormInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FormInputRepository extends JpaRepository<FormInput, Long> {
    List<FormInput> findByFormLayoutId(Long layoutId);
    
    // Add ordered query methods
    List<FormInput> findByFormLayoutIdOrderByOrdinalPositionAsc(Long layoutId);
    
    @Query("SELECT fi FROM FormInput fi WHERE fi.formLayout.id = :layoutId ORDER BY COALESCE(fi.ordinalPosition, 0), fi.id")
    List<FormInput> findByFormLayoutIdOrdered(@Param("layoutId") Long layoutId);
}
