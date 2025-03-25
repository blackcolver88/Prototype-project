package com.example.formservice.repository;
import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FormInputRepository extends JpaRepository<FormInput, Long> {
    List<FormInput> findByFormLayoutId(Long layoutId);
    
    // Add ordered query methods
    List<FormInput> findByFormLayoutIdOrderByOrdinalPositionAsc(Long layoutId);


    @Query("SELECT fi FROM FormInput fi WHERE fi.formLayout.id = :layoutId ORDER BY COALESCE(fi.ordinalPosition, 0), fi.id")
    List<FormInput> findByFormLayoutIdOrdered(@Param("layoutId") Long layoutId);



    @Query("SELECT fi FROM FormInput fi WHERE fi.formLayout.formTemplate.id = :formId")
    List<FormInput> findByFormLayoutFormId(@Param("formId") Long formId);




    FormInput findByFormValue(FormValue formValue);
}
