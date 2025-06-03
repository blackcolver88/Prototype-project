package com.example.formservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.FormSubmission;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {

    @Query("SELECT fs FROM FormSubmission fs WHERE fs.userId = :userId")
    List<FormSubmission> findByUserId(@Param("userId") Long userId);

    @Query("SELECT fs FROM FormSubmission fs WHERE fs.userId = :userId AND fs.idForm = :formId")
    List<FormSubmission> findByUserIdAndFormId(@Param("userId") Long userId, @Param("formId") Long formId);

    @Query("SELECT CASE WHEN COUNT(fs) > 0 THEN true ELSE false END FROM FormSubmission fs WHERE fs.userId = :userId AND fs.idForm = :formId")
    boolean existsByUserIdAndIdForm(@Param("userId") Long userId, @Param("formId") Long formId);

    @Query("SELECT fs FROM FormSubmission fs WHERE fs.targetRole = :targetRole")
    Page<FormSubmission> findByTargetRole(@Param("targetRole") String targetRole, Pageable pageable);
}
