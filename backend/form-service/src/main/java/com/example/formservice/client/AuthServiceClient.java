package com.example.formservice.client;

import com.example.formservice.DTO.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service", path = "/api/v1/users")
public interface AuthServiceClient {

    @GetMapping("/{id}")
    UserDTO getUserById(@PathVariable("id") Long id, @RequestHeader("Authorization") String authHeader);

    @GetMapping("/{id}")
    UserDTO getUserByIdInternal(@PathVariable("id") Long id);

    @GetMapping("/validate")
    boolean validateUser(@PathVariable("id") Long id, @RequestHeader("Authorization") String authHeader);
}