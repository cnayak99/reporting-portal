package com.chinmaynayak.reporting.departments.repository;

import com.chinmaynayak.reporting.departments.domain.DepartmentEntity;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Long> {

	@Query(value = """
			SELECT new com.chinmaynayak.reporting.departments.dto.DepartmentReportRow(
				d.id,
				d.name,
				manager.fullName,
				COUNT(employee.id),
				d.location
			)
			FROM DepartmentEntity d
			LEFT JOIN d.manager manager
			LEFT JOIN UserEntity employee ON employee.department = d
			WHERE (:searchPattern IS NULL OR lower(d.name) LIKE :searchPattern)
			  AND (:locationPattern IS NULL OR lower(d.location) LIKE :locationPattern)
			GROUP BY d.id, d.name, manager.fullName, d.location
			""",
			countQuery = """
					SELECT COUNT(d)
					FROM DepartmentEntity d
					WHERE (:searchPattern IS NULL OR lower(d.name) LIKE :searchPattern)
					  AND (:locationPattern IS NULL OR lower(d.location) LIKE :locationPattern)
					""")
	Page<DepartmentReportRow> searchReport(
			@Param("searchPattern") String searchPattern,
			@Param("locationPattern") String locationPattern,
			Pageable pageable);
}
