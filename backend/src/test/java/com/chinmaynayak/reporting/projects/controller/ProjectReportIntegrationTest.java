package com.chinmaynayak.reporting.projects.controller;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
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
class ProjectReportIntegrationTest {

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
		insertDepartment(101L, "Operations", "Vancouver");
		insertUser(200L, "Alice Chen", "alice.chen@example.com", "MANAGER", "ACTIVE", 100L);
		insertUser(201L, "Bob Stone", "bob.stone@example.com", "ENGINEER", "ACTIVE", 100L);
		insertProject(300L, "Apollo Migration", 100L, 200L, "ACTIVE",
				LocalDate.parse("2026-01-01"), null);
		insertProject(301L, "Atlas Build", 100L, 201L, "PLANNED",
				LocalDate.parse("2026-02-01"), LocalDate.parse("2026-08-01"));
	}

	@Test
	void projectsReportEndpointExecutesFullVerticalSlice() throws Exception {
		mockMvc.perform(get("/api/reports/projects")
						.param("page", "0")
						.param("size", "10")
						.param("q", "alice")
						.param("status", "ACTIVE")
						.param("departmentId", "100")
						.param("sort", "name,asc"))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(300))
				.andExpect(jsonPath("$.items[0].name").value("Apollo Migration"))
				.andExpect(jsonPath("$.items[0].department").value("Engineering"))
				.andExpect(jsonPath("$.items[0].owner").value("Alice Chen"))
				.andExpect(jsonPath("$.items[0].status").value("ACTIVE"))
				.andExpect(jsonPath("$.items[0].startDate").value("2026-01-01"))
				.andExpect(jsonPath("$.items[0].endDate").value(nullValue()))
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
}
