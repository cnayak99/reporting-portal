package com.chinmaynayak.reporting.users.controller;

import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;
import com.chinmaynayak.reporting.users.dto.UserReportQuery;
import com.chinmaynayak.reporting.users.dto.UserReportRow;
import com.chinmaynayak.reporting.users.service.UserReportService;
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
@RequestMapping("/api/reports/users")
@Tag(name = "Users Report", description = "Paginated user report")
public class UserReportController {

	private final UserReportService userReportService;

	public UserReportController(UserReportService userReportService) {
		this.userReportService = userReportService;
	}

	@GetMapping
	@Operation(
			summary = "Search users report",
			description = "Returns users with optional text, role, and status filters. Defaults: page=0, size=25, sort=name,asc. Size must be 1..100. Allowed sort fields: id, name, email, role, status, createdAt.",
			responses = {
					@ApiResponse(responseCode = "200", description = "Users report returned"),
					@ApiResponse(
							responseCode = "400",
							description = "Invalid page, size, sort, role, or status.",
							content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
			})
	public PagedResponse<UserReportRow> getUsersReport(
			@Parameter(description = "Zero-based page index. Must be greater than or equal to 0.", example = "0")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "Page size. Defaults to 25 and must be between 1 and 100.", example = "25")
			@RequestParam(required = false) Integer size,
			@Parameter(description = "Sort as field,direction. Allowed fields: id, name, email, role, status, createdAt.", example = "name,asc")
			@RequestParam(required = false) String sort,
			@Parameter(description = "Case-insensitive search over full name and email.", example = "alice")
			@RequestParam(required = false) String q,
			@Parameter(description = "Optional role filter.", example = "MANAGER")
			@RequestParam(required = false) UserRole role,
			@Parameter(description = "Optional status filter.", example = "ACTIVE")
			@RequestParam(required = false) UserStatus status) {

		UserReportQuery query = new UserReportQuery(page, size, sort, q, role, status);
		return userReportService.getUsersReport(query);
	}
}
