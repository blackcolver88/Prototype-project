package com.example.formservice.service;

import com.example.formservice.DTO.UserDTO;
import com.example.formservice.client.AuthServiceClient;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@Service
public class UserService {

    private final AuthServiceClient authServiceClient;

    public UserService(AuthServiceClient authServiceClient) {
        this.authServiceClient = authServiceClient;
    }

    public Optional<UserDTO> getUserById(Long id) {
        try {
            String authHeader = getAuthorizationHeader();
            if (authHeader == null) {
                // For internal service calls, use the method without auth header
                UserDTO user = authServiceClient.getUserByIdInternal(id);
                return Optional.ofNullable(user);
            }
            UserDTO user = authServiceClient.getUserById(id, authHeader);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean validateUser(Long userId) {
        try {
            String authHeader = getAuthorizationHeader();
            if (authHeader == null) {
                return false;
            }
            return authServiceClient.validateUser(userId, authHeader);
        } catch (Exception e) {
            return false;
        }
    }

    private String getAuthorizationHeader() {
        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (requestAttributes != null) {
            HttpServletRequest request = requestAttributes.getRequest();
            return request.getHeader("Authorization");
        }
        return null;
    }
}