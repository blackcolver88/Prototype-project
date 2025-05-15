package com.example.formservice.entities;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@EqualsAndHashCode(exclude = {"formInputs", "formSubmission"})
@ToString(exclude = {"formInputs", "formSubmission"})
public class FormValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String value;

    @ManyToMany
    @JoinTable(
        name = "form_value_inputs",
        joinColumns = @JoinColumn(name = "form_value_id"),
        inverseJoinColumns = @JoinColumn(name = "form_input_id")
    )
    private List<FormInput> formInputs = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "form_submission_id")
    @JsonIgnoreProperties("formValues")
    private FormSubmission formSubmission;
}
