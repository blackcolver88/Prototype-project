package com.example.auth_service.Authentication;

import com.example.auth_service.Entity.Role;
import com.example.auth_service.Entity.User;
import com.example.auth_service.Repository.RoleRepository;
import com.example.auth_service.Repository.UserRepository;
import com.example.auth_service.Service.EmailService;
import com.example.auth_service.Service.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationResponse register(RegisterRequest request) {
        LocalDateTime now = LocalDateTime.now();

        Role userRole;
        try {
            System.out.println("Received role from request: " + request.getRole());

            String roleName = request.getRole();
            if (!roleName.startsWith("ROLE_")) {
                roleName = "ROLE_" + roleName;
            }
            
            userRole = roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.findByName("ROLE_USER")
                            .orElseThrow(() -> new RuntimeException("Rôle par défaut non trouvé")));
        } catch (Exception e) {
            System.err.println("Error parsing role: " + e.getMessage());
            userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Rôle par défaut non trouvé"));
        }

        String originalPassword = request.getPassword();

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(originalPassword))
                .role(userRole)
                .accountLocked(request.isAccountLocked())
                .enabled(request.isEnabled())
                .createdDate(now)
                .lastModifiedDate(now)
                .photo(null)
                .build();
        repository.save(user);

        // Send welcome email with credentials
        emailService.sendWelcomeEmail(
            user.getEmail(),
            user.getFirstname(),
            user.getLastname(),
            originalPassword,
            userRole.getName()
        );

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }


    public boolean validateToken(String token) {
        try {
            jwtService.extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}