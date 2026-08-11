package com.chinmaynayak.reporting.departments.domain;

import com.chinmaynayak.reporting.users.domain.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "departments")
public class DepartmentEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(nullable = false, length = 160)
	private String location;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "manager_user_id")
	private UserEntity manager;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected DepartmentEntity() {
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getLocation() {
		return location;
	}

	public UserEntity getManager() {
		return manager;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
