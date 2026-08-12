package com.chinmaynayak.reporting.projects.repository;

import com.chinmaynayak.reporting.projects.domain.ProjectEntity;
import com.chinmaynayak.reporting.projects.domain.ProjectStatus;
import com.chinmaynayak.reporting.projects.dto.ProjectReportRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {

	@Query(value = """
			SELECT new com.chinmaynayak.reporting.projects.dto.ProjectReportRow(
				p.id,
				p.name,
				d.name,
				owner.fullName,
				p.status,
				p.startDate,
				p.endDate
			)
			FROM ProjectEntity p
			JOIN p.department d
			JOIN p.owner owner
			WHERE (:searchPattern IS NULL
				OR lower(p.name) LIKE :searchPattern
				OR lower(d.name) LIKE :searchPattern
				OR lower(owner.fullName) LIKE :searchPattern)
			  AND (:status IS NULL OR p.status = :status)
			  AND (:departmentId IS NULL OR d.id = :departmentId)
			""",
			countQuery = """
					SELECT COUNT(p)
					FROM ProjectEntity p
					JOIN p.department d
					JOIN p.owner owner
					WHERE (:searchPattern IS NULL
						OR lower(p.name) LIKE :searchPattern
						OR lower(d.name) LIKE :searchPattern
						OR lower(owner.fullName) LIKE :searchPattern)
					  AND (:status IS NULL OR p.status = :status)
					  AND (:departmentId IS NULL OR d.id = :departmentId)
					""")
	Page<ProjectReportRow> searchReport(
			@Param("searchPattern") String searchPattern,
			@Param("status") ProjectStatus status,
			@Param("departmentId") Long departmentId,
			Pageable pageable);
}
