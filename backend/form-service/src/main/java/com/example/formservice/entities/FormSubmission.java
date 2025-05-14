package com.example.formservice.entities;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;


@Data
@Entity
public class FormSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime date;

    private Long idForm;

    @Column(name = "user_id")
    private Long userId;

    // Add a transient field to store user data when needed
    @Transient
    private String userTask;

    @OneToMany(mappedBy = "formSubmission", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("formSubmission")  // Ignore the formSubmission property in FormValue
    private List<FormValue> formValues = new ArrayList<>();

    public void setUserTask(String firstName, String lastName) {
        this.userTask = firstName + " " + lastName;
    }

    public String getUserTask() {
        return this.userTask != null ? this.userTask : "Unknown User";
    }

}
