package com.example.formservice.repository;

import com.example.formservice.entities.FormValue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormValueRepository  extends JpaRepository<FormValue, Long> {
}
