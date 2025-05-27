package com.example.formservice.repository;

import com.example.formservice.entities.FormTemplateProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormTemplateProcessRepository extends JpaRepository<FormTemplateProcess, Long> {

    List<FormTemplateProcess> findByFormTemplateId(Long formTemplateId);

    @Query("SELECT ftp.processDefinitionKey FROM FormTemplateProcess ftp WHERE ftp.formTemplate.id = :formTemplateId")
    List<String> findProcessDefinitionKeysByFormTemplateId(@Param("formTemplateId") Long formTemplateId);

    void deleteByFormTemplateIdAndProcessDefinitionKey(Long formTemplateId, String processDefinitionKey);

    void deleteByFormTemplateId(Long formTemplateId);

    boolean existsByFormTemplateIdAndProcessDefinitionKey(Long formTemplateId, String processDefinitionKey);
}
