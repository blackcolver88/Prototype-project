package com.example.formservice.service;

import com.example.formservice.entities.User;
import com.example.formservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(Math.toIntExact(id));
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void deleteById(Long id) {
        userRepository.deleteById(Math.toIntExact(id));
    }

    public User updateUser(Long id, User user) {
        if (userRepository.existsById(Math.toIntExact(id))) {
            user.setId(id);
            return userRepository.save(user);
        } else {
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        }
    }
}
