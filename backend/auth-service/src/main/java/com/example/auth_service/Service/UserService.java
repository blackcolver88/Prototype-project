package com.example.auth_service.Service;

import com.example.auth_service.Entity.Role;
import com.example.auth_service.Entity.User;
import com.example.auth_service.Repository.RoleRepository;
import com.example.auth_service.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Utilisateur non trouvé avec l'ID: " + id);
        }
        userRepository.deleteById(id);
    }
    

    public User assignRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Rôle non trouvé avec l'ID: " + roleId));
        
        user.setRole(role);
        return userRepository.save(user);
    }


    public User assignRoleToUserByName(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID: " + userId));
        
        final String finalRoleName;
        if (!roleName.startsWith("ROLE_")) {
            finalRoleName = "ROLE_" + roleName;
        } else {
            finalRoleName = roleName;
        }
        
        Role role = roleRepository.findByName(finalRoleName)
                .orElseThrow(() -> new IllegalArgumentException("Rôle non trouvé avec le nom: " + finalRoleName));
        
        user.setRole(role);
        return userRepository.save(user);
    }
    

    public List<User> getUsersByRole(Long roleId) {
        final Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Rôle non trouvé avec l'ID: " + roleId));
        
        final Long finalRoleId = role.getId();
        
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().getId().equals(finalRoleId))
                .toList();
    }
    public Role findRoleByName(String roleName) {
        Optional<Role> roleOptional = roleRepository.findByRoleName(roleName);
        return roleOptional.orElse(null);
    }
    public User createUser(User user) {
        return userRepository.save(user);
    }
}
