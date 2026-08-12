package com.chinmaynayak.reporting.catalog.service;

import com.chinmaynayak.reporting.catalog.dto.ReportMetadata;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReportCatalogService {

	private static final List<ReportMetadata> REPORTS = List.of(
			new ReportMetadata(
					"users",
					"Users",
					"User identity, contact, role, status, and created date.",
					"/api/reports/users"),
			new ReportMetadata(
					"departments",
					"Departments",
					"Department names, managers, employee counts, and locations.",
					"/api/reports/departments"),
			new ReportMetadata(
					"projects",
					"Projects",
					"Project ownership, department, status, and schedule dates.",
					"/api/reports/projects"));

	public List<ReportMetadata> getReports() {
		return REPORTS;
	}
}
