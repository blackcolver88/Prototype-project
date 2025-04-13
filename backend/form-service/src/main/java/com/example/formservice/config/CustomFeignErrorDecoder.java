package com.example.formservice.config;

import feign.FeignException;
import feign.Response;
import feign.codec.ErrorDecoder;

public class CustomFeignErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() == 400) {
            return FeignException.errorStatus(methodKey, response); // Correct
        }
        return new RuntimeException("Unexpected error: " + response.status());
    }
}