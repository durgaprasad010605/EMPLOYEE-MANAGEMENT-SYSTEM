package com.employeetracker.security;

import com.employeetracker.entity.Employee;
import com.employeetracker.entity.Hr;
import com.employeetracker.entity.RoleType;
import com.employeetracker.entity.User;
import com.employeetracker.repository.EmployeeRepository;
import com.employeetracker.repository.HrRepository;
import com.employeetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HrRepository hrRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + usernameOrEmail));

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

        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole().name(),
                hrId,
                employeeId,
                displayName,
                user.isEnabled(),
                authorities
        );
    }
}
