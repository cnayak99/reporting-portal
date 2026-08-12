package com.chinmaynayak.reporting.catalog.controller;

import com.chinmaynayak.reporting.catalog.dto.ReportMetadata;
import com.chinmaynayak.reporting.catalog.service.ReportCatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportCatalogController {

	private final ReportCatalogService reportCatalogService;

	public ReportCatalogController(ReportCatalogService reportCatalogService) {
		this.reportCatalogService = reportCatalogService;
	}

	@GetMapping
	public List<ReportMetadata> getReports() {
		return reportCatalogService.getReports();
	}
}
