package com.example.formservice.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
public class MultipleValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    private List<String> valeurs;

    @ManyToOne
    @JoinColumn(name = "form_input_id")
    @JsonBackReference
    private FormInput formInput;
}
