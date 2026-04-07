package com.lms.controller;

import com.lms.entity.Content;
import com.lms.repository.ContentRepository;
import com.lms.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/instructor/content")
public class ContentController {

    private final ContentRepository contentRepository;
    private final FileStorageService storageService;

    public ContentController(ContentRepository contentRepository, FileStorageService storageService) {
        this.contentRepository = contentRepository;
        this.storageService = storageService;
    }

    @PostMapping
    public ResponseEntity<?> uploadContent(@RequestParam Long courseId, @RequestParam String title, @RequestParam String type,
                                           @RequestParam(required = false) MultipartFile file, @RequestParam(required = false) String url,
                                           @RequestParam(required = false) String uploadedBy) throws IOException {
        Content c = new Content();
        c.setCourseId(courseId);
        c.setTitle(title);
        c.setType(type);
        if (file != null) {
            String stored = storageService.storeFile(file);
            c.setUrl(stored);
        } else if (url != null) {
            c.setUrl(url);
        }
        c.setUploadedBy(uploadedBy != null ? uploadedBy : "system");
        contentRepository.save(c);
        return ResponseEntity.ok(c);
    }

    @GetMapping("/course/{courseId}")
    public List<Content> byCourse(@PathVariable Long courseId) { return contentRepository.findByCourseId(courseId); }
}
