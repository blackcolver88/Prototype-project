package com.example.auth_service.Authentication;


import com.example.auth_service.DTO.UserDTO;
import com.example.auth_service.Entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.auth_service.Service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    private final UserService userService; // Add this field

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


}
