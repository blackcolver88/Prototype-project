package com.example.formservice.entities;
import com.example.formservice.entities.enums.FormLayoutType;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class FormLayout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Long priority;

    @Enumerated(EnumType.STRING)
    private FormLayoutType type;

    @Column(length = 1000)
    private String style;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private FormLayout parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormLayout> children = new ArrayList<>();

    @OneToMany(mappedBy = "formLayout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormInput> formInputs = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "form_template_id")
    private FormTemplate formTemplate;
}

