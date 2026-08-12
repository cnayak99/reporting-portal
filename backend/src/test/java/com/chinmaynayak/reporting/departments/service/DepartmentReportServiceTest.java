package com.chinmaynayak.reporting.departments.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.chinmaynayak.reporting.common.web.PageMetadata;
import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportQuery;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportRow;
import java.sql.Timestamp;
import java.time.Instant;
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
@Import(DepartmentReportService.class)
class DepartmentReportServiceTest {

	private static final Instant CREATED_AT = Instant.parse("2026-01-15T14:30:00Z");
	private static final Instant UPDATED_AT = Instant.parse("2026-01-16T15:45:00Z");

	@Container
	@ServiceConnection
	static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private DepartmentReportService departmentReportService;

	@BeforeEach
	void setUp() {
		insertDepartment(100L, "Engineering", "Toronto");
		insertDepartment(101L, "Support", "Toronto");
		insertDepartment(102L, "Operations", "Vancouver");
		insertDepartment(103L, "Research", "Montreal");
		insertDepartment(104L, "Data Analytics", "Toronto");

		insertUser(200L, "Alice Chen", "alice.chen@example.com", "MANAGER", "ACTIVE", 100L);
		insertUser(201L, "Bob Stone", "bob.stone@example.com", "ENGINEER", "ACTIVE", 100L);
		insertUser(202L, "Carol Diaz", "carol.diaz@example.com", "MANAGER", "ACTIVE", 102L);
		insertUser(203L, "Dan Singh", "dan.singh@example.com", "OPERATIONS", "ACTIVE", 102L);
		insertUser(204L, "Eve Moran", "eve.moran@example.com", "ANALYST", "ACTIVE", 104L);

		updateManager(100L, 200L);
		updateManager(102L, 202L);
	}

	@Test
	void returnsEmployeeCountsManagersAndZeroEmployeeDepartments() {
		PagedResponse<DepartmentReportRow> response = departmentReportService.getDepartmentsReport(
				DepartmentReportQuery.defaults());

		assertThat(response.items()).containsExactly(
				new DepartmentReportRow(104L, "Data Analytics", null, 1L, "Toronto"),
				new DepartmentReportRow(100L, "Engineering", "Alice Chen", 2L, "Toronto"),
				new DepartmentReportRow(102L, "Operations", "Carol Diaz", 2L, "Vancouver"),
				new DepartmentReportRow(103L, "Research", null, 0L, "Montreal"),
				new DepartmentReportRow(101L, "Support", null, 0L, "Toronto"));
		assertThat(response.pagination()).isEqualTo(new PageMetadata(0, 25, 5, 1, false, false));
	}

	@Test
	void filtersByDepartmentNameCaseInsensitively() {
		PagedResponse<DepartmentReportRow> response = departmentReportService.getDepartmentsReport(
				query(null, null, null, "ENGINEER", null));

		assertThat(response.items()).containsExactly(
				new DepartmentReportRow(100L, "Engineering", "Alice Chen", 2L, "Toronto"));
	}

	@Test
	void filtersByExactLocationCaseInsensitively() {
		PagedResponse<DepartmentReportRow> response = departmentReportService.getDepartmentsReport(
				query(null, null, null, null, "toronto"));

		assertThat(response.items()).containsExactly(
				new DepartmentReportRow(104L, "Data Analytics", null, 1L, "Toronto"),
				new DepartmentReportRow(100L, "Engineering", "Alice Chen", 2L, "Toronto"),
				new DepartmentReportRow(101L, "Support", null, 0L, "Toronto"));
	}

	@Test
	void combinesNameAndLocationFilters() {
		PagedResponse<DepartmentReportRow> response = departmentReportService.getDepartmentsReport(
				query(null, null, null, "data", "TORONTO"));

		assertThat(response.items()).containsExactly(
				new DepartmentReportRow(104L, "Data Analytics", null, 1L, "Toronto"));
	}

	@Test
	void returnsPaginationMetadata() {
		PagedResponse<DepartmentReportRow> response = departmentReportService.getDepartmentsReport(
				query(1, 2, null, null, null));

		assertThat(response.items()).containsExactly(
				new DepartmentReportRow(102L, "Operations", "Carol Diaz", 2L, "Vancouver"),
				new DepartmentReportRow(103L, "Research", null, 0L, "Montreal"));
		assertThat(response.pagination()).isEqualTo(new PageMetadata(1, 2, 5, 3, true, true));
	}

	@Test
	void sortsByName() {
		PagedResponse<DepartmentReportRow> response = departmentReportService.getDepartmentsReport(
				query(null, null, "name,desc", null, null));

		assertThat(names(response)).containsExactly("Support", "Research", "Operations", "Engineering", "Data Analytics");
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

	private void updateManager(long departmentId, long managerUserId) {
		jdbcTemplate.update("""
				UPDATE departments
				SET manager_user_id = ?
				WHERE id = ?
				""",
				managerUserId,
				departmentId);
	}

	private static DepartmentReportQuery query(
			Integer page,
			Integer size,
			String sort,
			String q,
			String location) {
		return new DepartmentReportQuery(page, size, sort, q, location);
	}

	private static List<String> names(PagedResponse<DepartmentReportRow> response) {
		return response.items().stream()
				.map(DepartmentReportRow::name)
				.toList();
	}
}
