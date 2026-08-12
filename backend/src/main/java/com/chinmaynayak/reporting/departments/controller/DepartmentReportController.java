package com.chinmaynayak.reporting.departments.controller;

import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportQuery;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportRow;
import com.chinmaynayak.reporting.departments.service.DepartmentReportService;
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
@RequestMapping("/api/reports/departments")
@Tag(name = "Departments Report", description = "Paginated department report")
public class DepartmentReportController {

	private final DepartmentReportService departmentReportService;

	public DepartmentReportController(DepartmentReportService departmentReportService) {
		this.departmentReportService = departmentReportService;
	}

	@GetMapping
	@Operation(
			summary = "Search departments report",
			description = "Returns departments with derived employee counts and optional name/location filters. Defaults: page=0, size=25, sort=name,asc. Size must be 1..100. Allowed sort fields: id, name, location.",
			responses = {
					@ApiResponse(responseCode = "200", description = "Departments report returned"),
					@ApiResponse(
							responseCode = "400",
							description = "Invalid page, size, or sort.",
							content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
			})
	public PagedResponse<DepartmentReportRow> getDepartmentsReport(
			@Parameter(description = "Zero-based page index. Must be greater than or equal to 0.", example = "0")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "Page size. Defaults to 25 and must be between 1 and 100.", example = "25")
			@RequestParam(required = false) Integer size,
			@Parameter(description = "Sort as field,direction. Allowed fields: id, name, location.", example = "name,asc")
			@RequestParam(required = false) String sort,
			@Parameter(description = "Case-insensitive search over department name.", example = "engineering")
			@RequestParam(required = false) String q,
			@Parameter(description = "Case-insensitive search over location text, such as city or state.", example = "Durham")
			@RequestParam(required = false) String location) {

		DepartmentReportQuery query = new DepartmentReportQuery(page, size, sort, q, location);
		return departmentReportService.getDepartmentsReport(query);
	}
}
