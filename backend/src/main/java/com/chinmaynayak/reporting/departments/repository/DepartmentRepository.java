package com.chinmaynayak.reporting.departments.repository;

import com.chinmaynayak.reporting.departments.domain.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Long> {
}
