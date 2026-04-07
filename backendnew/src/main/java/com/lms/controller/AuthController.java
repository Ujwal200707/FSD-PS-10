package com.lms.controller;

import com.lms.dto.AuthRequest;
import com.lms.dto.RegisterRequest;
import com.lms.entity.User;
import com.lms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("username_exists");
        }

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("email_exists");
        }

        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPassword(req.getPassword());

        var roles = new HashSet<String>();
        roles.add(req.getRole() != null ? req.getRole().toLowerCase() : "student"); // ✅ lowercase

        u.setRoles(roles);

        userRepository.save(u);

        return ResponseEntity.ok(u);
    }

    // ✅ LOGIN (FIXED: username OR email)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {

        // try username first
        var uOpt = userRepository.findByUsername(req.getUsername());

        // if not found → try email
        if (uOpt.isEmpty()) {
            uOpt = userRepository.findByEmail(req.getUsername());
        }

        // still not found
        if (uOpt.isEmpty()) {
            return ResponseEntity.status(401).body("user_not_found");
        }

        var u = uOpt.get();

        // password check
        if (!req.getPassword().equals(u.getPassword())) {
            return ResponseEntity.status(401).body("invalid_password");
        }

        return ResponseEntity.ok(u);
    }

    // ✅ FORGOT PASSWORD
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {

        var uOpt = userRepository.findByEmail(email);

        if (uOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("no_user");
        }

        return ResponseEntity.ok("reset_link_sent_mock");
    }
}