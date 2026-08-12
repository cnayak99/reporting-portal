package com.chinmaynayak.reporting.projects.controller;

import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.projects.domain.ProjectStatus;
import com.chinmaynayak.reporting.projects.dto.ProjectReportQuery;
import com.chinmaynayak.reporting.projects.dto.ProjectReportRow;
import com.chinmaynayak.reporting.projects.service.ProjectReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports/projects")
public class ProjectReportController {

	private final ProjectReportService projectReportService;

	public ProjectReportController(ProjectReportService projectReportService) {
		this.projectReportService = projectReportService;
	}

	@GetMapping
	public PagedResponse<ProjectReportRow> getProjectsReport(
			@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer size,
			@RequestParam(required = false) String sort,
			@RequestParam(required = false) String q,
			@RequestParam(required = false) ProjectStatus status,
			@RequestParam(required = false) Long departmentId) {

		ProjectReportQuery query = new ProjectReportQuery(page, size, sort, q, status, departmentId);
		return projectReportService.getProjectsReport(query);
	}
}
