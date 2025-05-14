package com.example.formservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    private String role;
    // We'll use firstname+lastname as the "task" that was in the original User entity
}
