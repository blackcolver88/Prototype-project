package com.example.auth_service.Authentication;


import com.example.auth_service.DTO.UserDTO;
import com.example.auth_service.Entity.User;
import com.example.auth_service.Entity.Role;
import com.example.auth_service.Repository.RoleRepository;
import com.example.auth_service.Repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.auth_service.Service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    private final UserService userService; // Add this field
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;


    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> getAvailableRoles() {
        List<Map<String, Object>> roles = roleRepository.findAll().stream()
                .map(role -> {
                    Map<String, Object> roleMap = new HashMap<>();
                    roleMap.put("id", role.getId());
                    roleMap.put("name", role.getName());
                    return roleMap;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }
    

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            String roleName = request.getRole();

            if (roleName == null || roleName.isBlank()) {
                roleName = "ROLE_USER";
            }

            if (!roleName.startsWith("ROLE_")) {
                roleName = "ROLE_" + roleName;
            }

            if (!roleRepository.existsByName(roleName)) {
                List<String> availableRoles = roleRepository.findAll()
                        .stream()
                        .map(Role::getName)
                        .collect(Collectors.toList());

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "message", "Le rôle spécifié n'existe pas : " + roleName,
                                "availableRoles", availableRoles
                        ));
            }

            AuthenticationResponse response = service.register(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur lors de l'enregistrement : " + e.getMessage()));
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity <AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ){

        return ResponseEntity.ok(service.authenticate(request));

    }


    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestParam String token) {
        if (service.validateToken(token)) {
            return ResponseEntity.ok("Token is valid");
        } else {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/validate/{id}")
    public ResponseEntity<Boolean> validateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.existsById(id));
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstname(user.getFirstname());
        dto.setLastname(user.getLastname());
        if (user.getRole() != null) {
            dto.setRole(user.getRole().getName());
        } else {
            dto.setRole("ROLE_USER");
        }
        return dto;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers().stream()
                .filter(user -> user.getRole() != null && !"ROLE_ADMIN".equals(user.getRole().getName())) 
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/modifier/{id}")
    public ResponseEntity<?> modifierUser(@PathVariable("id") Long id,
                                          @Valid @RequestBody RegisterRequest registerRequest) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id));

        if (registerRequest.getFirstname() != null && !registerRequest.getFirstname().isEmpty()) {
            user.setFirstname(registerRequest.getFirstname());
        }

        if (registerRequest.getLastname() != null && !registerRequest.getLastname().isEmpty()) {
            user.setLastname(registerRequest.getLastname());
        }

        if (registerRequest.getEmail() != null && !registerRequest.getEmail().isEmpty()) {
            user.setEmail(registerRequest.getEmail());
        }

        if (registerRequest.getPassword() != null && !registerRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        }

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur modifié avec succès !"));
    }

    @PutMapping("/ModifierPhoto/{iduser}")
    public ResponseEntity<?> ModifierUserPhoto(@PathVariable("iduser") Long id,
                                               @RequestParam("file") MultipartFile file) {

        String message = "";

        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Le fichier est vide !"));
        }

        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        if (fileName.contains("..")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Nom de fichier invalide : " + fileName));
        }

        try {
            User user = userRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id)
            );

            user.setPhoto(file.getBytes());
            userRepository.save(user);

            message = "Photo utilisateur mise à jour avec succès : " + fileName;
            return ResponseEntity.status(HttpStatus.OK).body(new MessageResponse(message));

        } catch (Exception e) {
            message = "Impossible d'uploader la photo : " + fileName + " !";
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new MessageResponse(message));
        }
    }
    @GetMapping("/GetPhoto/{iduser}")
    public ResponseEntity<?> getUserPhoto(@PathVariable("iduser") Long id) {
        try {
            User user = userRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id)
            );

            if (user.getPhoto() == null || user.getPhoto().length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Aucune photo trouvée pour cet utilisateur"));
            }

            String photoBase64 = Base64.getEncoder().encodeToString(user.getPhoto());

            Map<String, String> response = new HashMap<>();
            response.put("photo", photoBase64);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Erreur lors de la récupération de la photo : " + e.getMessage()));
        }
    }
    @GetMapping("/users/count")
    public ResponseEntity<Long> countUsers() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("Rôle ADMIN non trouvé"));
        
        Long userCount = userRepository.countByRoleNot(adminRole);
        return ResponseEntity.ok(userCount);
    }

}
