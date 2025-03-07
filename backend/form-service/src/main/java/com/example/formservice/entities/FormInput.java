package com.example.formservice.entities;
import com.example.formservice.entities.enums.FormInputType;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
public class FormInput {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private FormInputType type;

    private boolean required;
    

    @ManyToOne
    @JoinColumn(name = "form_layout_id")
    private FormLayout formLayout;

    @ManyToOne
    @JoinColumn(name = "form_value_id")
    private FormValue formValue;

    @OneToMany(mappedBy = "formInput", cascade = CascadeType.ALL)
    @JsonManagedReference  // Add this annotation to manage the reference
    private List<MultipleValue> multipleValues;


}
