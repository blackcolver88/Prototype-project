package com.example.formservice.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class FormValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String value;

    @OneToMany(mappedBy = "formValue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormInput> formInputs= new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "form_submission_id")
    private FormSubmission formSubmission;

}
