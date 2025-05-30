package com.example.auth_service.DTO;

import com.example.auth_service.Entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private Long id;
    private String name;

    public static RoleDTO fromEntity(Role role) {
        return RoleDTO.builder()
                .id(role.getId())
                .name(role.getName())

                .build();
    }
    
    public Role toEntity() {
        return Role.builder()
                .id(this.id)
                .name(this.name)
                .build();
    }
}
