package com.example.formservice.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Data
@Entity
@EqualsAndHashCode(exclude = {"formInput"})
@ToString(exclude = {"formInput"})
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
