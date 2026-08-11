package com.chinmaynayak.reporting.projects.domain;

import com.chinmaynayak.reporting.departments.domain.DepartmentEntity;
import com.chinmaynayak.reporting.users.domain.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "projects")
public class ProjectEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 160)
	private String name;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "department_id", nullable = false)
	private DepartmentEntity department;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_user_id", nullable = false)
	private UserEntity owner;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private ProjectStatus status;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected ProjectEntity() {
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public DepartmentEntity getDepartment() {
		return department;
	}

	public UserEntity getOwner() {
		return owner;
	}

	public ProjectStatus getStatus() {
		return status;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
