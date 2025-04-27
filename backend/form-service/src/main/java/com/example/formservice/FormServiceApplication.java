package com.example.formservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class FormServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FormServiceApplication.class, args);
    }

}
