package com.employeetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EmployeeTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeTrackerApplication.class, args);
        System.out.println("==================================================");
        System.out.println(" Employee Tracker Backend running on port 8080");
        System.out.println(" Health check: http://localhost:8080/api/health");
        System.out.println("==================================================");
    }
}
