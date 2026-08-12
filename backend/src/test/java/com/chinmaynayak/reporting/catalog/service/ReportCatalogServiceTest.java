package com.chinmaynayak.reporting.catalog.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.chinmaynayak.reporting.catalog.dto.ReportMetadata;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReportCatalogServiceTest {

	private final ReportCatalogService reportCatalogService = new ReportCatalogService();

	@Test
	void returnsAvailableReportMetadata() {
		List<ReportMetadata> reports = reportCatalogService.getReports();

		assertThat(reports).containsExactly(
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
	}
}
