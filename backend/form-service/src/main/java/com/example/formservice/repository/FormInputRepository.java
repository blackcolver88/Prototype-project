package com.example.formservice.repository;
import com.example.formservice.entities.FormInput;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormInputRepository extends JpaRepository<FormInput, Long> {
}
