package com.example.formservice.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
@Data
@Entity
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String task;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<FormSubmission> formSubmissions;


}
