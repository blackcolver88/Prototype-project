package com.example.formservice.repository;

import com.example.formservice.entities.FormInput;
import com.example.formservice.entities.FormValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FormInputRepository extends JpaRepository<FormInput, Long> {

    List<FormInput> findByFormLayoutId(Long formLayoutId);

    // Replace the old method with this new one that works with ManyToMany
    @Query("SELECT fi FROM FormInput fi JOIN fi.multipleValues mv WHERE mv.id = :valueId")
    FormInput findByMultipleValueId(@Param("valueId") Long valueId);

    // Fix this query to use entity relationships instead of direct table reference
    @Query("SELECT fi FROM FormValue fv JOIN fv.formInputs fi WHERE fv.id = :valueId")
    FormInput findByFormValueId(@Param("valueId") Long valueId);

    // Add ordered query methods
    List<FormInput> findByFormLayoutIdOrderByOrdinalPositionAsc(Long layoutId);

    @Query("SELECT fi FROM FormInput fi WHERE fi.formLayout.id = :layoutId ORDER BY COALESCE(fi.ordinalPosition, 0), fi.id")
    List<FormInput> findByFormLayoutIdOrdered(@Param("layoutId") Long layoutId);

    @Query("SELECT fi FROM FormInput fi WHERE fi.formLayout.formTemplate.id = :formId")
    List<FormInput> findByFormLayoutFormId(@Param("formId") Long formId);

    // This method needs to be replaced as it uses the old relationship model
    // Replace with a method that works with the new ManyToMany relationship
    @Query("SELECT fi FROM FormValue fv JOIN fv.formInputs fi WHERE fv = :formValue")
    List<FormInput> findByFormValue(@Param("formValue") FormValue formValue);

    @Query("SELECT fi.title FROM FormInput fi WHERE fi.id = :id")
    Optional<String> findTitleById(@Param("id") Long id);

    List<FormInput> findByFormLayoutId(Long formLayoutId);


}
