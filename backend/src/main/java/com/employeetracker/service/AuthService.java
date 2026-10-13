package com.employeetracker.service;

import com.employeetracker.dto.LoginRequest;
import com.employeetracker.dto.LoginResponse;
import com.employeetracker.entity.Employee;
import com.employeetracker.entity.Hr;
import com.employeetracker.entity.RoleType;
import com.employeetracker.entity.User;
import com.employeetracker.repository.EmployeeRepository;
import com.employeetracker.repository.HrRepository;
import com.employeetracker.repository.UserRepository;
import com.employeetracker.security.JwtTokenProvider;
import com.employeetracker.security.UserPrincipal;
import com.employeetracker.util.PasswordHashGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HrRepository hrRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public LoginResponse login(LoginRequest request) {
        String identifier = request.getUsername();
        if (identifier == null || identifier.isBlank()) {
            throw new BadCredentialsException("Username or email is required");
        }

        // Validate user exists and is active before authentication
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isEnabled()) {
            throw new DisabledException("Your account is deactivated. Please contact an administrator.");
        }

        // Detect legacy BCrypt hashes to guide migration safely
        if (PasswordHashGenerator.isLegacyBcryptHash(user.getPasswordHash())) {
            throw new BadCredentialsException(
                "Account password uses legacy BCrypt encryption. Please update your password hash to SHA-256 format per the migration guide."
            );
        }

        // Calculate SHA-256 of entered password and compare using MessageDigest.isEqual
        if (!PasswordHashGenerator.verify(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Map<String, Object> userMap = buildUserMap(user, principal);
        return new LoginResponse(jwt, userMap);
    }

    public Map<String, Object> getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Long hrId = null;
        Long employeeId = null;
        String displayName = user.getUsername();

        if (user.getRole() == RoleType.HR) {
            Hr hr = hrRepository.findByUserId(user.getId()).orElse(null);
            if (hr != null) {
                hrId = hr.getId();
                if (hr.getFullName() != null && !hr.getFullName().isBlank()) {
                    displayName = hr.getFullName();
                }
            }
        } else if (user.getRole() == RoleType.EMPLOYEE) {
            Employee emp = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (emp != null) {
                employeeId = emp.getId();
                if (emp.getFullName() != null && !emp.getFullName().isBlank()) {
                    displayName = emp.getFullName();
                }
            }
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("role", user.getRole().name());
        map.put("displayName", displayName);
        map.put("hrId", hrId);
        map.put("employeeId", employeeId);
        map.put("enabled", user.isEnabled());
        return map;
    }

    private Map<String, Object> buildUserMap(User user, UserPrincipal principal) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("role", user.getRole().name());
        map.put("displayName", principal.getDisplayName());
        map.put("hrId", principal.getHrId());
        map.put("employeeId", principal.getEmployeeId());
        map.put("enabled", user.isEnabled());
        return map;
    }
}
