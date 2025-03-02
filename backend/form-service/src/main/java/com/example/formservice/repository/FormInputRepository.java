package com.example.formservice.repository;
import com.example.formservice.entities.FormInput;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormInputRepository extends JpaRepository<FormInput, Long> {
    List<FormInput> findByFormLayoutId(Long layoutId);

}
