package com.chinmaynayak.reporting.users.controller;

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
class UserReportIntegrationTest {

	private static final long ENGINEERING_DEPARTMENT_ID = 100L;
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
		insertEngineeringDepartment();
		insertUser(200L, "Alice Chen", "alice.chen@example.com", "MANAGER", "ACTIVE");
		insertUser(201L, "Alice Rivera", "alice.rivera@example.com", "ENGINEER", "ACTIVE");
		insertUser(202L, "Mina Patel", "mina.patel@example.com", "MANAGER", "ACTIVE");
		insertUser(203L, "Alice Morgan", "alice.morgan@example.com", "MANAGER", "INACTIVE");
	}

	@Test
	void usersReportEndpointExecutesFullVerticalSlice() throws Exception {
		mockMvc.perform(get("/api/reports/users")
						.param("page", "0")
						.param("size", "10")
						.param("q", "alice")
						.param("role", "MANAGER")
						.param("status", "ACTIVE")
						.param("sort", "name,asc"))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items.length()").value(1))
				.andExpect(jsonPath("$.items[0].id").value(200))
				.andExpect(jsonPath("$.items[0].name").value("Alice Chen"))
				.andExpect(jsonPath("$.items[0].email").value("alice.chen@example.com"))
				.andExpect(jsonPath("$.items[0].role").value("MANAGER"))
				.andExpect(jsonPath("$.items[0].status").value("ACTIVE"))
				.andExpect(jsonPath("$.items[0].createdAt").value("2026-01-15T14:30:00Z"))
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
}
