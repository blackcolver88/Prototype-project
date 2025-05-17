package com.example.auth_service.Authentication;

import com.example.auth_service.Entity.User;
import com.example.auth_service.Enum.Role;
import com.example.auth_service.Repository.UserRepository;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        LocalDateTime now = LocalDateTime.now();

        // Parse the role from the request
        Role userRole;
        try {
            // Log the received role value
            System.out.println("Received role from request: " + request.getRole());

            // Convert string to enum
            userRole = Role.valueOf(request.getRole());
        } catch (Exception e) {
            // Fallback to default role if parsing fails
            System.err.println("Error parsing role: " + e.getMessage());
            userRole = Role.ROLE_USER;
        }

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole) // Use the parsed role instead of hardcoding ROLE_ADMIN
                .accountLocked(request.isAccountLocked())
                .enabled(request.isEnabled())
                .createdDate(now)      // Set the current date/time
                .lastModifiedDate(now)

                .build();
        repository.save(user);
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