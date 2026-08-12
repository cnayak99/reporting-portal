package com.chinmaynayak.reporting.catalog.controller;

import com.chinmaynayak.reporting.catalog.dto.ReportMetadata;
import com.chinmaynayak.reporting.catalog.service.ReportCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Report Catalog", description = "Available report definitions")
public class ReportCatalogController {

	private final ReportCatalogService reportCatalogService;

	public ReportCatalogController(ReportCatalogService reportCatalogService) {
		this.reportCatalogService = reportCatalogService;
	}

	@GetMapping
	@Operation(
			summary = "List available reports",
			description = "Returns static report metadata for the available reporting endpoints. This endpoint does not query PostgreSQL.")
	public List<ReportMetadata> getReports() {
		return reportCatalogService.getReports();
	}
}
