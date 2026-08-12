package com.chinmaynayak.reporting.departments.controller;

import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportQuery;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportRow;
import com.chinmaynayak.reporting.departments.service.DepartmentReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports/departments")
public class DepartmentReportController {

	private final DepartmentReportService departmentReportService;

	public DepartmentReportController(DepartmentReportService departmentReportService) {
		this.departmentReportService = departmentReportService;
	}

	@GetMapping
	public PagedResponse<DepartmentReportRow> getDepartmentsReport(
			@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer size,
			@RequestParam(required = false) String sort,
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String location) {

		DepartmentReportQuery query = new DepartmentReportQuery(page, size, sort, q, location);
		return departmentReportService.getDepartmentsReport(query);
	}
}
