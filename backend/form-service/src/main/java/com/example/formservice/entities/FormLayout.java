package com.example.formservice.entities;
import com.example.formservice.entities.enums.FormLayoutType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.ArrayList;
import java.util.List;
@Data
@Entity
@EqualsAndHashCode(exclude = {"parent", "children", "formInputs", "formTemplate"})
@ToString(exclude = {"parent", "children", "formInputs", "formTemplate"})
public class FormLayout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private FormLayoutType type;

    @Column(name = "ordinal_position")
    private Integer ordinalPosition = 0;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference 
    private FormLayout parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference 
    private List<FormLayout> children = new ArrayList<>();

    @OneToMany(mappedBy = "formLayout", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private List<FormInput> formInputs = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_template_id")
    @JsonIgnore 
    private FormTemplate formTemplate;

    public Integer getOrdinalPosition() {
        return ordinalPosition;
    }

    public void setOrdinalPosition(Integer ordinalPosition) {
        this.ordinalPosition = ordinalPosition;
    }
}