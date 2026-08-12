package com.chinmaynayak.reporting.projects.controller;

import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.projects.domain.ProjectStatus;
import com.chinmaynayak.reporting.projects.dto.ProjectReportQuery;
import com.chinmaynayak.reporting.projects.dto.ProjectReportRow;
import com.chinmaynayak.reporting.projects.service.ProjectReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports/projects")
@Tag(name = "Projects Report", description = "Paginated project report")
public class ProjectReportController {

	private final ProjectReportService projectReportService;

	public ProjectReportController(ProjectReportService projectReportService) {
		this.projectReportService = projectReportService;
	}

	@GetMapping
	@Operation(
			summary = "Search projects report",
			description = "Returns projects with department and owner names. Defaults: page=0, size=25, sort=name,asc. Size must be 1..100. Allowed sort fields: id, name, status, startDate, endDate.",
			responses = {
					@ApiResponse(responseCode = "200", description = "Projects report returned"),
					@ApiResponse(
							responseCode = "400",
							description = "Invalid page, size, sort, status, or departmentId.",
							content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
			})
	public PagedResponse<ProjectReportRow> getProjectsReport(
			@Parameter(description = "Zero-based page index. Must be greater than or equal to 0.", example = "0")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "Page size. Defaults to 25 and must be between 1 and 100.", example = "25")
			@RequestParam(required = false) Integer size,
			@Parameter(description = "Sort as field,direction. Allowed fields: id, name, status, startDate, endDate.", example = "name,asc")
			@RequestParam(required = false) String sort,
			@Parameter(description = "Case-insensitive search over project name, department name, and owner full name.", example = "dashboard")
			@RequestParam(required = false) String q,
			@Parameter(description = "Optional project status filter.", example = "ACTIVE")
			@RequestParam(required = false) ProjectStatus status,
			@Parameter(description = "Optional department ID filter. Must be greater than 0 when supplied.", example = "1001")
			@RequestParam(required = false) Long departmentId) {

		ProjectReportQuery query = new ProjectReportQuery(page, size, sort, q, status, departmentId);
		return projectReportService.getProjectsReport(query);
	}
}
