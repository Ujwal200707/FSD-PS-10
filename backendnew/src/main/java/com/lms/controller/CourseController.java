package com.lms.controller;

import com.lms.entity.Course;
import com.lms.repository.CourseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course c) {
        return ResponseEntity.ok(courseRepository.save(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Course c) {
        var opt = courseRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        var existing = opt.get();
        existing.setTitle(c.getTitle());
        existing.setDescription(c.getDescription());
        return ResponseEntity.ok(courseRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<Course> getAll() { return courseRepository.findAll(); }

    @GetMapping("/mine")
    public List<Course> myCourses(@RequestParam(required = false) String instructorUsername) {
        if (instructorUsername == null) return List.of();
        return courseRepository.findByInstructorUsername(instructorUsername);
    }
}
