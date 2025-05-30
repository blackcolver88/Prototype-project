package com.example.auth_service.Repository;

import com.example.auth_service.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.auth_service.Entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Long countByRoleNot(Role role);
    Long countByRole(Role role);

}
