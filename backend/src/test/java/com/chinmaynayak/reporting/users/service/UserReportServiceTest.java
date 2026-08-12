package com.chinmaynayak.reporting.users.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.chinmaynayak.reporting.common.error.ErrorCode;
import com.chinmaynayak.reporting.common.error.InvalidReportQueryException;
import com.chinmaynayak.reporting.common.web.PageMetadata;
import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;
import com.chinmaynayak.reporting.users.dto.UserReportQuery;
import com.chinmaynayak.reporting.users.dto.UserReportRow;
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
@Import(UserReportService.class)
class UserReportServiceTest {

	private static final long ENGINEERING_DEPARTMENT_ID = 100L;
	private static final Instant CREATED_AT = Instant.parse("2026-01-15T14:30:00Z");
	private static final Instant UPDATED_AT = Instant.parse("2026-01-16T15:45:00Z");

	@Container
	@ServiceConnection
	static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private UserReportService userReportService;

	@BeforeEach
	void setUp() {
		insertEngineeringDepartment();
		insertUser(200L, "Alice Chen", "alice.chen@example.com", "MANAGER", "ACTIVE");
		insertUser(201L, "Bob Stone", "bob.stone@example.com", "ENGINEER", "ACTIVE");
		insertUser(202L, "Alicia Vega", "alicia.vega@example.com", "ANALYST", "INACTIVE");
		insertUser(203L, "Zoe Patel", "zoe.patel@example.com", "MANAGER", "ACTIVE");
		insertUser(204L, "Sam Taylor", "sam.one@example.com", "ENGINEER", "ACTIVE");
		insertUser(205L, "Sam Taylor", "sam.two@example.com", "ANALYST", "ACTIVE");
		insertUser(206L, "Casey Morgan", "casey@Reports.Example.com", "OPERATIONS", "ACTIVE");
	}

	@Test
	void returnsDefaultPagination() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(UserReportQuery.defaults());

		assertThat(ids(response)).containsExactly(200L, 202L, 201L, 206L, 204L, 205L, 203L);
		assertThat(response.pagination()).isEqualTo(new PageMetadata(0, 25, 7, 1, false, false));
	}

	@Test
	void qMatchesName() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(null, null, null, " ali ", null, null));

		assertThat(ids(response)).containsExactly(200L, 202L);
	}

	@Test
	void qMatchesEmailCaseInsensitively() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(null, null, null, "REPORTS.EXAMPLE", null, null));

		assertThat(ids(response)).containsExactly(206L);
		assertThat(response.items().getFirst().email()).isEqualTo("casey@Reports.Example.com");
	}

	@Test
	void filtersByRole() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(null, null, null, null, UserRole.MANAGER, null));

		assertThat(ids(response)).containsExactly(200L, 203L);
	}

	@Test
	void filtersByStatus() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(null, null, null, null, null, UserStatus.INACTIVE));

		assertThat(ids(response)).containsExactly(202L);
	}

	@Test
	void combinesSearchRoleAndStatusFilters() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(null, null, null, "patel", UserRole.MANAGER, UserStatus.ACTIVE));

		assertThat(ids(response)).containsExactly(203L);
	}

	@Test
	void returnsEmptyResults() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(null, null, null, "nobody", null, null));

		assertThat(response.items()).isEmpty();
		assertThat(response.pagination()).isEqualTo(new PageMetadata(0, 25, 0, 0, false, false));
	}

	@Test
	void returnsPaginationMetadata() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(1, 3, null, null, null, null));

		assertThat(ids(response)).containsExactly(206L, 204L, 205L);
		assertThat(response.pagination()).isEqualTo(new PageMetadata(1, 3, 7, 3, true, true));
	}

	@Test
	void usesDeterministicIdTieBreakerForSorting() {
		PagedResponse<UserReportRow> response = userReportService.getUsersReport(
				query(null, null, "name,asc", "sam", null, null));

		assertThat(ids(response)).containsExactly(204L, 205L);
	}

	@Test
	void rejectsInvalidPage() {
		UserReportQuery query = query(-1, null, null, null, null, null);

		assertThatThrownBy(() -> userReportService.getUsersReport(query))
				.isInstanceOfSatisfying(InvalidReportQueryException.class, exception -> {
					assertThat(exception.getCode()).isEqualTo(ErrorCode.INVALID_PAGE);
					assertThat(exception).hasMessage("page must be greater than or equal to 0");
				});
	}

	@Test
	void rejectsInvalidSize() {
		UserReportQuery tooSmall = query(null, 0, null, null, null, null);
		UserReportQuery tooLarge = query(null, 101, null, null, null, null);

		assertThatThrownBy(() -> userReportService.getUsersReport(tooSmall))
				.isInstanceOfSatisfying(InvalidReportQueryException.class, exception -> {
					assertThat(exception.getCode()).isEqualTo(ErrorCode.INVALID_PAGE_SIZE);
					assertThat(exception).hasMessage("size must be between 1 and 100");
				});
		assertThatThrownBy(() -> userReportService.getUsersReport(tooLarge))
				.isInstanceOfSatisfying(InvalidReportQueryException.class, exception -> {
					assertThat(exception.getCode()).isEqualTo(ErrorCode.INVALID_PAGE_SIZE);
					assertThat(exception).hasMessage("size must be between 1 and 100");
				});
	}

	@Test
	void rejectsUnsupportedSortField() {
		UserReportQuery query = query(null, null, "department,asc", null, null, null);

		assertThatThrownBy(() -> userReportService.getUsersReport(query))
				.isInstanceOfSatisfying(InvalidReportQueryException.class, exception -> {
					assertThat(exception.getCode()).isEqualTo(ErrorCode.INVALID_SORT);
					assertThat(exception).hasMessage("unsupported sort field: department");
				});
	}

	private void insertEngineeringDepartment() {
		jdbcTemplate.update("""
				INSERT INTO departments (id, name, location, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?)
				""",
				ENGINEERING_DEPARTMENT_ID,
				"Engineering",
				"Toronto",
				Timestamp.from(CREATED_AT),
				Timestamp.from(UPDATED_AT));
	}

	private void insertUser(long id, String fullName, String email, String role, String status) {
		jdbcTemplate.update("""
				INSERT INTO users (id, full_name, email, role, status, department_id, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				""",
				id,
				fullName,
				email,
				role,
				status,
				ENGINEERING_DEPARTMENT_ID,
				Timestamp.from(CREATED_AT),
				Timestamp.from(UPDATED_AT));
	}

	private static UserReportQuery query(
			Integer page,
			Integer size,
			String sort,
			String q,
			UserRole role,
			UserStatus status) {
		return new UserReportQuery(page, size, sort, q, role, status);
	}

	private static List<Long> ids(PagedResponse<UserReportRow> response) {
		return response.items().stream()
				.map(UserReportRow::id)
				.toList();
	}
}
