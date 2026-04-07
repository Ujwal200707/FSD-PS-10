package com.lms.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.entity.Quiz;
import com.lms.entity.QuizSubmission;
import com.lms.repository.QuizRepository;
import com.lms.repository.QuizSubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizSubmissionRepository submissionRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public QuizController(QuizRepository quizRepository, QuizSubmissionRepository submissionRepository) {
        this.quizRepository = quizRepository;
        this.submissionRepository = submissionRepository;
    }

    @PostMapping("/api/instructor/quiz")
    public ResponseEntity<?> createQuiz(@RequestBody Quiz q, @RequestParam(required = false) String createdBy) {
        q.setCreatedBy(createdBy != null ? createdBy : q.getCreatedBy());
        quizRepository.save(q);
        return ResponseEntity.ok(q);
    }

    @GetMapping("/api/student/quiz/{id}")
    public ResponseEntity<?> getQuiz(@PathVariable Long id) {
        return quizRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/student/quiz/{id}/attempt")
    public ResponseEntity<?> attempt(@PathVariable Long id, @RequestBody String answersJson, @RequestParam(required = false) String studentUsername) throws Exception {
        var quiz = quizRepository.findById(id).orElseThrow();
        List<String> correct = mapper.readValue(quiz.getCorrectAnswersJson(), new TypeReference<List<String>>(){});
        List<String> answers = mapper.readValue(answersJson, new TypeReference<List<String>>(){});
        double score = 0;
        for (int i = 0; i < Math.min(answers.size(), correct.size()); i++) if (answers.get(i).equals(correct.get(i))) score += 1;
        double percentage = (score / Math.max(1, correct.size())) * (quiz.getMaxScore() != null ? quiz.getMaxScore() : 100);
        QuizSubmission s = new QuizSubmission();
        s.setQuizId(id);
        s.setStudentUsername(studentUsername != null ? studentUsername : "anon");
        s.setAnswersJson(answersJson);
        s.setScore(percentage);
        submissionRepository.save(s);
        return ResponseEntity.ok(s);
    }

    @GetMapping("/api/instructor/quiz/{id}/submissions")
    public List<QuizSubmission> submissions(@PathVariable Long id) { return submissionRepository.findByQuizId(id); }
}
