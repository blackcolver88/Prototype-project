package com.example.formservice.entities;
import com.example.formservice.entities.enums.FormInputType;
import jakarta.persistence.*;
import lombok.Data;

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


}
