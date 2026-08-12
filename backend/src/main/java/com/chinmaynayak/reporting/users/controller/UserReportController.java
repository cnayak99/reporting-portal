package com.chinmaynayak.reporting.users.controller;

import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;
import com.chinmaynayak.reporting.users.dto.UserReportQuery;
import com.chinmaynayak.reporting.users.dto.UserReportRow;
import com.chinmaynayak.reporting.users.service.UserReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports/users")
public class UserReportController {

	private final UserReportService userReportService;

	public UserReportController(UserReportService userReportService) {
		this.userReportService = userReportService;
	}

	@GetMapping
	public PagedResponse<UserReportRow> getUsersReport(
			@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer size,
			@RequestParam(required = false) String sort,
			@RequestParam(required = false) String q,
			@RequestParam(required = false) UserRole role,
			@RequestParam(required = false) UserStatus status) {

		UserReportQuery query = new UserReportQuery(page, size, sort, q, role, status);
		return userReportService.getUsersReport(query);
	}
}
