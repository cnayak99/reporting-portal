package com.chinmaynayak.reporting.users.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.chinmaynayak.reporting.users.domain.UserEntity;
import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;
import java.sql.Timestamp;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
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
class UserRepositoryTest {

	private static final long ENGINEERING_DEPARTMENT_ID = 100L;
	private static final long ALICE_USER_ID = 200L;
	private static final Instant CREATED_AT = Instant.parse("2026-01-15T14:30:00Z");
	private static final Instant UPDATED_AT = Instant.parse("2026-01-16T15:45:00Z");

	@Container
	@ServiceConnection
	static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private UserRepository userRepository;

	@Test
	void findByIdLoadsUserFieldsAndLazyDepartment() {
		insertEngineeringDepartment();
		insertAliceChen();

		UserEntity user = userRepository.findById(ALICE_USER_ID).orElseThrow();

		assertThat(user.getId()).isEqualTo(ALICE_USER_ID);
		assertThat(user.getFullName()).isEqualTo("Alice Chen");
		assertThat(user.getEmail()).isEqualTo("alice.chen@example.com");
		assertThat(user.getRole()).isEqualTo(UserRole.MANAGER);
		assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
		assertThat(user.getCreatedAt()).isEqualTo(CREATED_AT);
		assertThat(user.getUpdatedAt()).isEqualTo(UPDATED_AT);
		assertThat(user.getDepartment().getName()).isEqualTo("Engineering");
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

	private void insertAliceChen() {
		jdbcTemplate.update("""
				INSERT INTO users (id, full_name, email, role, status, department_id, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				""",
				ALICE_USER_ID,
				"Alice Chen",
				"alice.chen@example.com",
				"MANAGER",
				"ACTIVE",
				ENGINEERING_DEPARTMENT_ID,
				Timestamp.from(CREATED_AT),
				Timestamp.from(UPDATED_AT));
	}
}
