package com.chinmaynayak.reporting.users.dto;

import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;

public record UserReportQuery(
		Integer page,
		Integer size,
		String sort,
		String q,
		UserRole role,
		UserStatus status) {

	public static UserReportQuery defaults() {
		return new UserReportQuery(null, null, null, null, null, null);
	}
}
