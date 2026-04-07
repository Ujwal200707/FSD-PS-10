package com.lms.repository;

import com.lms.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByCourseId(Long courseId);
    List<Progress> findByUsername(String username);
}
