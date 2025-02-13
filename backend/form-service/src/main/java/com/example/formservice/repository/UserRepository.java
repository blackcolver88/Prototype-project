package com.example.formservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.formservice.entities.User;

public interface UserRepository extends JpaRepository<User, Integer> {
}
