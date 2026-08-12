package com.chinmaynayak.reporting.projects.controller;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chinmaynayak.reporting.common.error.ErrorCode;
import com.chinmaynayak.reporting.common.error.InvalidReportQueryException;
import com.chinmaynayak.reporting.common.web.PageMetadata;
import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.projects.domain.ProjectStatus;
import com.chinmaynayak.reporting.projects.dto.ProjectReportQuery;
import com.chinmaynayak.reporting.projects.dto.ProjectReportRow;
import com.chinmaynayak.reporting.projects.service.ProjectReportService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProjectReportController.class)
class ProjectReportControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private ProjectReportService projectReportService;

	@Test
	void getProjectsReportReturnsOkWithItemsAndPagination() throws Exception {
		when(projectReportService.getProjectsReport(any())).thenReturn(responseWithApollo());

		mockMvc.perform(get("/api/reports/projects"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items[0].id").value(300))
				.andExpect(jsonPath("$.items[0].name").value("Apollo Migration"))
				.andExpect(jsonPath("$.items[0].department").value("Engineering"))
				.andExpect(jsonPath("$.items[0].owner").value("Alice Chen"))
				.andExpect(jsonPath("$.items[0].status").value("ACTIVE"))
				.andExpect(jsonPath("$.items[0].startDate").value("2026-01-01"))
				.andExpect(jsonPath("$.items[0].endDate").value(nullValue()))
				.andExpect(jsonPath("$.pagination.page").value(0))
				.andExpect(jsonPath("$.pagination.size").value(25));
	}

	@Test
	void nonPositiveDepartmentIdReturnsProblemDetail() throws Exception {
		ProjectReportQuery zeroQuery = new ProjectReportQuery(null, null, null, null, null, 0L);
		ProjectReportQuery negativeQuery = new ProjectReportQuery(null, null, null, null, null, -1L);
		InvalidReportQueryException exception = new InvalidReportQueryException(
				ErrorCode.INVALID_PARAMETER,
				"departmentId must be greater than 0");

		when(projectReportService.getProjectsReport(zeroQuery)).thenThrow(exception);
		when(projectReportService.getProjectsReport(negativeQuery)).thenThrow(exception);

		mockMvc.perform(get("/api/reports/projects").param("departmentId", "0"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid report query"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("departmentId must be greater than 0"))
				.andExpect(jsonPath("$.code").value("INVALID_PARAMETER"));

		mockMvc.perform(get("/api/reports/projects").param("departmentId", "-1"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid report query"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("departmentId must be greater than 0"))
				.andExpect(jsonPath("$.code").value("INVALID_PARAMETER"));
	}

	@Test
	void invalidDepartmentIdTextReturnsProblemDetail() throws Exception {
		mockMvc.perform(get("/api/reports/projects").param("departmentId", "abc"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid request parameter"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("Invalid value for parameter 'departmentId'."))
				.andExpect(jsonPath("$.code").value("INVALID_PARAMETER"))
				.andExpect(jsonPath("$.parameter").value("departmentId"));

		verifyNoInteractions(projectReportService);
	}

	@Test
	void invalidStatusReturnsProblemDetail() throws Exception {
		mockMvc.perform(get("/api/reports/projects").param("status", "DONE"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid request parameter"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("Invalid value for parameter 'status'."))
				.andExpect(jsonPath("$.code").value("INVALID_PARAMETER"))
				.andExpect(jsonPath("$.parameter").value("status"));

		verifyNoInteractions(projectReportService);
	}

	@Test
	void invalidSortReturnsProblemDetail() throws Exception {
		ProjectReportQuery query = new ProjectReportQuery(null, null, "owner,asc", null, null, null);
		when(projectReportService.getProjectsReport(query))
				.thenThrow(new InvalidReportQueryException(
						ErrorCode.INVALID_SORT,
						"unsupported sort field: owner"));

		mockMvc.perform(get("/api/reports/projects").param("sort", "owner,asc"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid report query"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("unsupported sort field: owner"))
				.andExpect(jsonPath("$.code").value("INVALID_SORT"));
	}

	private static PagedResponse<ProjectReportRow> responseWithApollo() {
		return new PagedResponse<>(
				List.of(new ProjectReportRow(
						300L,
						"Apollo Migration",
						"Engineering",
						"Alice Chen",
						ProjectStatus.ACTIVE,
						LocalDate.parse("2026-01-01"),
						null)),
				new PageMetadata(0, 25, 1, 1, false, false));
	}
}
