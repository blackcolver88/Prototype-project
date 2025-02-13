package com.example.formservice.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class FormTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @OneToMany(mappedBy = "formTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormLayout> formLayouts = new ArrayList<>();
}
