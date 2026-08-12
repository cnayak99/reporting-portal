package com.chinmaynayak.reporting.projects.dto;

import com.chinmaynayak.reporting.projects.domain.ProjectStatus;

public record ProjectReportQuery(
		Integer page,
		Integer size,
		String sort,
		String q,
		ProjectStatus status,
		Long departmentId) {

	public static ProjectReportQuery defaults() {
		return new ProjectReportQuery(null, null, null, null, null, null);
	}
}
