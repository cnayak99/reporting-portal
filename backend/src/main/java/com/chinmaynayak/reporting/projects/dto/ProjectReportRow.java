package com.chinmaynayak.reporting.projects.dto;

import com.chinmaynayak.reporting.projects.domain.ProjectStatus;
import java.time.LocalDate;

public record ProjectReportRow(
		Long id,
		String name,
		String department,
		String owner,
		ProjectStatus status,
		LocalDate startDate,
		LocalDate endDate) {
}
