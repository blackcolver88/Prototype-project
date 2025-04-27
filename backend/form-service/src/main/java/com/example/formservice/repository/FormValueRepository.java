package com.example.formservice.repository;

import com.example.formservice.entities.FormValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormValueRepository  extends JpaRepository<FormValue, Long> {
    List<FormValue> findByFormSubmissionId(Long submissionId);



}
