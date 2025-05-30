package com.example.auth_service.Service;

import com.example.auth_service.Entity.Role;
import com.example.auth_service.Repository.RoleRepository;
import com.example.auth_service.Repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;


    @PostConstruct
    public void initDefaultRoles() {
        createRoleIfNotExists("ROLE_ADMIN");
    }

    private void createRoleIfNotExists(String name) {
        if (!roleRepository.existsByName(name)) {
            Role role = Role.builder()
                    .name(name)
                    .build();
            roleRepository.save(role);
        }
    }

 
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }


    public Optional<Role> getRoleById(Long id) {
        return roleRepository.findById(id);
    }


    public Optional<Role> getRoleByName(String name) {
        return roleRepository.findByName(name);
    }


    @Transactional
    public Role createRole(Role role) {
        if (roleRepository.existsByName(role.getName())) {
            throw new IllegalArgumentException("Un rôle avec ce nom existe déjà");
        }

        if (!role.getName().startsWith("ROLE_")) {
            role.setName("ROLE_" + role.getName());
        }


        return roleRepository.save(role);
    }

 
    @Transactional
    public Role updateRole(Long id, Role roleDetails) {
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rôle non trouvé avec l'ID: " + id));
        
        if (!existingRole.getName().equals(roleDetails.getName()) && 
            roleRepository.existsByName(roleDetails.getName())) {
            throw new IllegalArgumentException("Un rôle avec ce nom existe déjà");
        }
        
        if (!roleDetails.getName().startsWith("ROLE_")) {
            roleDetails.setName("ROLE_" + roleDetails.getName());
        }
        
        existingRole.setName(roleDetails.getName());

        
        return roleRepository.save(existingRole);
    }


    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rôle non trouvé avec l'ID: " + id));
        
        Long userCount = userRepository.countByRole(role);
        if (userCount > 0) {
            throw new IllegalStateException("Ce rôle est attribué à " + userCount + " utilisateur(s) et ne peut pas être supprimé");
        }
        
        roleRepository.delete(role);
    }
}
