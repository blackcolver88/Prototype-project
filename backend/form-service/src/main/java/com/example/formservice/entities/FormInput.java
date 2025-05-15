package com.example.formservice.entities;
import com.example.formservice.entities.enums.FormInputType;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Data
@Entity
@EqualsAndHashCode(exclude = {"formLayout", "multipleValues"})
@ToString(exclude = {"formLayout", "multipleValues"})
public class FormInput {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private FormInputType type;

    private boolean required;
    
    @Column(name = "ordinal_position")
    private Integer ordinalPosition = 0;

    @ManyToOne
    @JoinColumn(name = "form_layout_id")
    private FormLayout formLayout;

    @OneToMany(mappedBy = "formInput", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<MultipleValue> multipleValues;
}
