package com.example.formservice.repository;

import com.example.formservice.entities.FormValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FormValueRepository extends JpaRepository<FormValue, Long> {
    List<FormValue> findByFormSubmissionId(Long submissionId);
    
    // Add this query method to find FormValues by FormInput ID
    @Query("SELECT fv FROM FormValue fv JOIN fv.formInputs fi WHERE fi.id = :inputId")
    List<FormValue> findByFormInputsId(@Param("inputId") Long inputId);
}
