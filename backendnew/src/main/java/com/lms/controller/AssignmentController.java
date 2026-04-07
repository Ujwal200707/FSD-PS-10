package com.lms.controller;

import com.lms.entity.Assignment;
import com.lms.entity.AssignmentSubmission;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.AssignmentSubmissionRepository;
import com.lms.service.FileStorageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")   // allow frontend from any origin (vite port may vary)
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final FileStorageService storageService;

    public AssignmentController(AssignmentRepository assignmentRepository,
                                AssignmentSubmissionRepository submissionRepository,
                                FileStorageService storageService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.storageService = storageService;
    }

    // ✅ CREATE ASSIGNMENT
    @PostMapping
    public Assignment create(@RequestBody Assignment a) {
        return assignmentRepository.save(a);
    }

    // ✅ GET ALL ASSIGNMENTS
    @GetMapping
    public List<Assignment> all() {
        return assignmentRepository.findAll();
    }

    // ✅ SUBMIT ASSIGNMENT
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable Long id,
                                   @RequestParam("file") MultipartFile file,
                                   @RequestParam(required = false) String studentUsername) {

        try {
            System.out.println("STEP 1: API HIT");

            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));

            String storedFile = storageService.storeFile(file);

            AssignmentSubmission sub = new AssignmentSubmission();
            sub.setAssignmentId(id);
            sub.setStudentUsername(
                    studentUsername != null ? studentUsername : "anonymous"
            );
            sub.setFilePath(storedFile);
            sub.setSubmittedAt(LocalDateTime.now());

            System.out.println("STEP 2: Before save");

            submissionRepository.save(sub);

            System.out.println("STEP 3: Saved with ID = " + sub.getId());

            return ResponseEntity.ok(sub);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error submitting assignment");
        }
    }

    // ✅ GET SUBMISSIONS BY ASSIGNMENT
    @GetMapping("/{id}/submissions")
    public List<AssignmentSubmission> subs(@PathVariable Long id) {
        return submissionRepository.findByAssignmentId(id);
    }

    // ✅ GRADE SUBMISSION
    @PostMapping("/submission/{subId}/grade")
    public ResponseEntity<?> grade(@PathVariable Long subId,
                                  @RequestParam Double grade,
                                  @RequestParam(required = false) String feedback) {

        AssignmentSubmission s = submissionRepository.findById(subId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        s.setGrade(grade);
        s.setFeedback(feedback);

        submissionRepository.save(s);

        return ResponseEntity.ok(s);
    }
}