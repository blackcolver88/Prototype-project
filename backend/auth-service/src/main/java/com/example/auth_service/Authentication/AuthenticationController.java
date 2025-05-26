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

//    @PutMapping(value = "/ModifierPhoto/{iduser}")
//    public ResponseEntity<?> modifierUserPhoto(@PathVariable("iduser") Long id,
//                                               @RequestParam("file") MultipartFile file) {
//
//        Optional<User> optionalUser = userRepository.findById(id);
//
//        if (optionalUser.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body("Utilisateur introuvable avec l'ID : " + id);
//        }
//
//        User user = optionalUser.get();
//
//        String fileName = file.getOriginalFilename();
//
//
//        if (fileName.contains("..")) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body("Nom de fichier invalide");
//        }
//
//        try {
//            // Encoder en Base64
//            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
//            user.setPhoto(base64Image);
//            userRepository.save(user);
//
//            String message = "Photo mise à jour avec succès pour l'utilisateur : " + user.getEmail();
//            return ResponseEntity.ok(new MessageResponse(message));
//
//        } catch (IOException e) {
//            String message = "Échec de la mise à jour de la photo : " + e.getMessage();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new MessageResponse(message));
//        }
//    }
//
//    @GetMapping("/photo/{id}")
//    public ResponseEntity<byte[]> getUserPhoto(@PathVariable Long id) {
//        Optional<User> userOpt = userRepository.findById(id);
//
//        if (userOpt.isEmpty() || userOpt.get().getPhoto() == null) {
//            return ResponseEntity.notFound().build();
//        }
//
//        String base64Image = userOpt.get().getPhoto().split(",")[1]; 
//        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
//                .body(imageBytes);
//    }




}
