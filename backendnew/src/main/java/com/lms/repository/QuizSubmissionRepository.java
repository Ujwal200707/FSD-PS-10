package com.lms.repository;

import com.lms.entity.QuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {
    List<QuizSubmission> findByQuizId(Long quizId);
    List<QuizSubmission> findByStudentUsername(String username);
}
