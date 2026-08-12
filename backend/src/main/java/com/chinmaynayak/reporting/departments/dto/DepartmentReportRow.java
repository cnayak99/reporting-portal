package com.chinmaynayak.reporting.departments.dto;

public record DepartmentReportRow(
		Long id,
		String name,
		String manager,
		long employeeCount,
		String location) {
}
