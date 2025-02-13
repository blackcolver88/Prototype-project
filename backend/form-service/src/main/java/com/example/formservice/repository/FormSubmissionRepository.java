package com.example.formservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.FormSubmission;

public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {
}
