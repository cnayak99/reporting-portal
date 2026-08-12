package com.chinmaynayak.reporting.departments.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class DepartmentReportIntegrationTest {

	private static final Instant CREATED_AT = Instant.parse("2026-01-15T14:30:00Z");
	private static final Instant UPDATED_AT = Instant.parse("2026-01-16T15:45:00Z");

	@Container
	@ServiceConnection
	static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@BeforeEach
	void setUp() {
		deleteExistingData();
		insertDepartment(100L, "Engineering", "Toronto");
		insertDepartment(101L, "Support", "Toronto");
		insertUser(200L, "Alice Chen", "alice.chen@example.com", "MANAGER", "ACTIVE", 100L);
		insertUser(201L, "Bob Stone", "bob.stone@example.com", "ENGINEER", "ACTIVE", 100L);
		updateManager(100L, 200L);
	}

	@Test
	void departmentsReportEndpointExecutesFullVerticalSlice() throws Exception {
		mockMvc.perform(get("/api/reports/departments")
						.param("page", "0")
						.param("size", "10")
						.param("q", "engineer")
						.param("location", "toronto")
						.param("sort", "name,asc"))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(100))
				.andExpect(jsonPath("$.items[0].name").value("Engineering"))
				.andExpect(jsonPath("$.items[0].manager").value("Alice Chen"))
				.andExpect(jsonPath("$.items[0].employeeCount").value(2))
				.andExpect(jsonPath("$.items[0].location").value("Toronto"))
				.andExpect(jsonPath("$.pagination.page").value(0))
				.andExpect(jsonPath("$.pagination.size").value(10))
				.andExpect(jsonPath("$.pagination.totalItems").value(1))
				.andExpect(jsonPath("$.pagination.totalPages").value(1))
				.andExpect(jsonPath("$.pagination.hasNext").value(false))
				.andExpect(jsonPath("$.pagination.hasPrevious").value(false));
	}

	private void deleteExistingData() {
		jdbcTemplate.update("DELETE FROM projects");
		jdbcTemplate.update("UPDATE departments SET manager_user_id = NULL");
		jdbcTemplate.update("DELETE FROM users");
		jdbcTemplate.update("DELETE FROM departments");
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
}
