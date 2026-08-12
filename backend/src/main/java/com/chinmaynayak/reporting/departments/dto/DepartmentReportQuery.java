package com.chinmaynayak.reporting.departments.dto;

public record DepartmentReportQuery(
		Integer page,
		Integer size,
		String sort,
		String q,
		String location) {

	public static DepartmentReportQuery defaults() {
		return new DepartmentReportQuery(null, null, null, null, null);
	}
}
