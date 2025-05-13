package com.example.auth_service.Service;

import com.example.auth_service.Entity.User;
import com.example.auth_service.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }
}
