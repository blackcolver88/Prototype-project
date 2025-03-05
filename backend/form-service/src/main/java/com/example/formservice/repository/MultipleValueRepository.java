package com.example.formservice.repository;

import com.example.formservice.entities.MultipleValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MultipleValueRepository extends JpaRepository<MultipleValue, Long> {
    List<MultipleValue> findByFormInputId(Long formInputId);

}
