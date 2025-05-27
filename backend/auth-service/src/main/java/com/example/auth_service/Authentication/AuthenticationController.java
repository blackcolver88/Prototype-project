package com.example.auth_service.Authentication;


import com.example.auth_service.DTO.UserDTO;
import com.example.auth_service.Entity.User;
import com.example.auth_service.Enum.Role;
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
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    private final UserService userService; // Add this field
    private final UserRepository userRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity <AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ){
      return ResponseEntity.ok(service.register(request));
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
        dto.setRole(user.getRole().name());
        return dto;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers().stream()
                .filter(user -> !Role.ROLE_ADMIN.equals(user.getRole())) 
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

}
