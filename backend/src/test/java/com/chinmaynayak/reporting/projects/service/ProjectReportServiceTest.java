package com.chinmaynayak.reporting.projects.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.chinmaynayak.reporting.common.web.PageMetadata;
import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.projects.domain.ProjectStatus;
import com.chinmaynayak.reporting.projects.dto.ProjectReportQuery;
import com.chinmaynayak.reporting.projects.dto.ProjectReportRow;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@DataJpaTest(properties = {
		"spring.jpa.show-sql=true",
		"spring.jpa.properties.hibernate.format_sql=true"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@Import(ProjectReportService.class)
class ProjectReportServiceTest {

	private static final Instant CREATED_AT = Instant.parse("2026-01-15T14:30:00Z");
	private static final Instant UPDATED_AT = Instant.parse("2026-01-16T15:45:00Z");

	@Container
	@ServiceConnection
	static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private ProjectReportService projectReportService;

	@BeforeEach
	void setUp() {
		insertDepartment(100L, "Engineering", "Toronto");
		insertDepartment(101L, "Operations", "Vancouver");

		insertUser(200L, "Alice Chen", "alice.chen@example.com", "MANAGER", "ACTIVE", 100L);
		insertUser(201L, "Bob Stone", "bob.stone@example.com", "ENGINEER", "ACTIVE", 100L);
		insertUser(202L, "Carol Diaz", "carol.diaz@example.com", "OPERATIONS", "ACTIVE", 101L);

		insertProject(300L, "Apollo Migration", 100L, 200L, "ACTIVE",
				LocalDate.parse("2026-01-01"), null);
		insertProject(301L, "Atlas Build", 100L, 201L, "PLANNED",
				LocalDate.parse("2026-02-01"), LocalDate.parse("2026-08-01"));
		insertProject(302L, "Beacon Cleanup", 101L, 202L, "COMPLETED",
				LocalDate.parse("2025-01-01"), LocalDate.parse("2025-12-31"));
		insertProject(303L, "Delta Launch", 100L, 200L, "ACTIVE",
				LocalDate.parse("2026-03-01"), LocalDate.parse("2026-12-31"));
		insertProject(304L, "Echo Stabilization", 101L, 201L, "ON_HOLD",
				LocalDate.parse("2026-04-01"), null);
		insertProject(305L, "Apollo Migration", 101L, 202L, "ACTIVE",
				LocalDate.parse("2026-01-02"), null);
	}

	@Test
	void returnsProjectedProjectFieldsIncludingDepartmentOwnerAndNullableEndDate() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, "id,asc", "apollo migration", null, 100L));

		assertThat(response.items()).containsExactly(
				new ProjectReportRow(
						300L,
						"Apollo Migration",
						"Engineering",
						"Alice Chen",
						ProjectStatus.ACTIVE,
						LocalDate.parse("2026-01-01"),
						null));
	}

	@Test
	void qMatchesProjectName() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, "beacon", null, null));

		assertThat(ids(response)).containsExactly(302L);
	}

	@Test
	void qMatchesDepartmentName() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, "operations", null, null));

		assertThat(ids(response)).containsExactly(305L, 302L, 304L);
	}

	@Test
	void qMatchesOwnerName() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, "carol", null, null));

		assertThat(ids(response)).containsExactly(305L, 302L);
	}

	@Test
	void qIsCaseInsensitive() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, "APOLLO", null, null));

		assertThat(ids(response)).containsExactly(300L, 305L);
	}

	@Test
	void filtersByStatus() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, null, ProjectStatus.ACTIVE, null));

		assertThat(ids(response)).containsExactly(300L, 305L, 303L);
	}

	@Test
	void filtersByDepartmentId() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, null, null, 100L));

		assertThat(ids(response)).containsExactly(300L, 301L, 303L);
	}

	@Test
	void combinesSearchStatusAndDepartmentFilters() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, "launch", ProjectStatus.ACTIVE, 100L));

		assertThat(ids(response)).containsExactly(303L);
	}

	@Test
	void positiveNonexistentDepartmentIdReturnsEmptyResult() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, null, null, null, 999L));

		assertThat(response.items()).isEmpty();
		assertThat(response.pagination()).isEqualTo(new PageMetadata(0, 25, 0, 0, false, false));
	}

	@Test
	void returnsPaginationMetadata() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(1, 2, null, null, null, null));

		assertThat(ids(response)).containsExactly(301L, 302L);
		assertThat(response.pagination()).isEqualTo(new PageMetadata(1, 2, 6, 3, true, true));
	}

	@Test
	void sortsBySupportedFields() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, "status,asc", null, null, null));

		assertThat(ids(response)).containsExactly(300L, 303L, 305L, 302L, 304L, 301L);
	}

	@Test
	void addsIdTieBreakerForDuplicateProjectNames() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, "name,asc", "apollo", null, null));

		assertThat(ids(response)).containsExactly(300L, 305L);
	}

	@Test
	void sortsEndDateAscendingWithNullsLast() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, "endDate,asc", null, null, null));

		assertThat(ids(response)).containsExactly(302L, 301L, 303L, 300L, 304L, 305L);
	}

	@Test
	void sortsEndDateDescendingWithNullsLast() {
		PagedResponse<ProjectReportRow> response = projectReportService.getProjectsReport(
				query(null, null, "endDate,desc", null, null, null));

		assertThat(ids(response)).containsExactly(303L, 301L, 302L, 300L, 304L, 305L);
	}

	private void insertDepartment(long id, String name, String location) {
		jdbcTemplate.update("""
				INSERT INTO departments (id, name, location, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?)
				""",
				id,
				name,
				location,
				Timestamp.from(CREATED_AT),
				Timestamp.from(UPDATED_AT));
	}

	private void insertUser(
			long id,
			String fullName,
			String email,
			String role,
			String status,
			long departmentId) {
		jdbcTemplate.update("""
				INSERT INTO users (id, full_name, email, role, status, department_id, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				""",
				id,
				fullName,
				email,
				role,
				status,
				departmentId,
				Timestamp.from(CREATED_AT),
				Timestamp.from(UPDATED_AT));
	}

	private void insertProject(
			long id,
			String name,
			long departmentId,
			long ownerUserId,
			String status,
			LocalDate startDate,
			LocalDate endDate) {
		jdbcTemplate.update("""
				INSERT INTO projects (id, name, department_id, owner_user_id, status, start_date, end_date, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				""",
				id,
				name,
				departmentId,
				ownerUserId,
				status,
				Date.valueOf(startDate),
				endDate == null ? null : Date.valueOf(endDate),
				Timestamp.from(CREATED_AT),
				Timestamp.from(UPDATED_AT));
	}

	private static ProjectReportQuery query(
			Integer page,
			Integer size,
			String sort,
			String q,
			ProjectStatus status,
			Long departmentId) {
		return new ProjectReportQuery(page, size, sort, q, status, departmentId);
	}

	private static List<Long> ids(PagedResponse<ProjectReportRow> response) {
		return response.items().stream()
				.map(ProjectReportRow::id)
				.toList();
	}
}
