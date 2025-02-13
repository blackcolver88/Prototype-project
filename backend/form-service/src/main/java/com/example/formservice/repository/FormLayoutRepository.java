package com.example.formservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.FormLayout;

public interface FormLayoutRepository extends JpaRepository<FormLayout, Long> {
}

