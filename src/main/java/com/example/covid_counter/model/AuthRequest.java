package com.example.covid_counter.model;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
