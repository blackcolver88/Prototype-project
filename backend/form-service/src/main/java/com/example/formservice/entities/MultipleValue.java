package com.example.formservice.entities;

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
    private FormInput formInput;
}
