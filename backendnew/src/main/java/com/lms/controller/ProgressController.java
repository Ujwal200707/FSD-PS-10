package com.lms.controller;

import com.lms.entity.Progress;
import com.lms.repository.ProgressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProgressController {

    private final ProgressRepository progressRepository;

    public ProgressController(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @PostMapping("/student/progress")
    public ResponseEntity<?> saveProgress(@RequestBody Progress p) {
        p.setUsername(p.getUsername());
        p.setUpdatedAt(LocalDateTime.now());
        if (p.getTotalLessons() != null && p.getTotalLessons() > 0) {
            p.setPercentage((p.getCompletedLessons() * 100.0) / p.getTotalLessons());
        }
        progressRepository.save(p);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/instructor/progress/{courseId}/analytics")
    public List<Progress> analytics(@PathVariable Long courseId) {
        return progressRepository.findByCourseId(courseId);
    }

    @GetMapping("/student/progress/mine")
    public List<Progress> myProgress(@RequestParam(required = false) String username) {
        if (username == null) return List.of();
        return progressRepository.findByUsername(username);
    }
}
