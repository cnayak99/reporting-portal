package com.chinmaynayak.reporting.users.dto;

import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;
import java.time.Instant;

public record UserReportRow(
		Long id,
		String name,
		String email,
		UserRole role,
		UserStatus status,
		Instant createdAt) {
}
