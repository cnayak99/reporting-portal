package com.chinmaynayak.reporting.projects.repository;

import com.chinmaynayak.reporting.projects.domain.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
}
