package com.chinmaynayak.reporting.departments.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chinmaynayak.reporting.common.error.ErrorCode;
import com.chinmaynayak.reporting.common.error.InvalidReportQueryException;
import com.chinmaynayak.reporting.common.web.PageMetadata;
import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportQuery;
import com.chinmaynayak.reporting.departments.dto.DepartmentReportRow;
import com.chinmaynayak.reporting.departments.service.DepartmentReportService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DepartmentReportController.class)
class DepartmentReportControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private DepartmentReportService departmentReportService;

	@Test
	void getDepartmentsReportReturnsOkWithItemsAndPagination() throws Exception {
		when(departmentReportService.getDepartmentsReport(any())).thenReturn(responseWithEngineering());

		mockMvc.perform(get("/api/reports/departments"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items[0].id").value(100))
				.andExpect(jsonPath("$.items[0].name").value("Engineering"))
				.andExpect(jsonPath("$.items[0].manager").value("Alice Chen"))
				.andExpect(jsonPath("$.items[0].employeeCount").value(2))
				.andExpect(jsonPath("$.items[0].location").value("Toronto"))
				.andExpect(jsonPath("$.pagination.page").value(0))
				.andExpect(jsonPath("$.pagination.size").value(25));
	}

	@Test
	void invalidPageReturnsProblemDetail() throws Exception {
		DepartmentReportQuery query = new DepartmentReportQuery(-1, null, null, null, null);
		when(departmentReportService.getDepartmentsReport(query))
				.thenThrow(new InvalidReportQueryException(
						ErrorCode.INVALID_PAGE,
						"page must be greater than or equal to 0"));

		mockMvc.perform(get("/api/reports/departments").param("page", "-1"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid report query"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("page must be greater than or equal to 0"))
				.andExpect(jsonPath("$.code").value("INVALID_PAGE"));
	}

	@Test
	void invalidSizeReturnsProblemDetail() throws Exception {
		DepartmentReportQuery query = new DepartmentReportQuery(null, 500, null, null, null);
		when(departmentReportService.getDepartmentsReport(query))
				.thenThrow(new InvalidReportQueryException(
						ErrorCode.INVALID_PAGE_SIZE,
						"size must be between 1 and 100"));

		mockMvc.perform(get("/api/reports/departments").param("size", "500"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid report query"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("size must be between 1 and 100"))
				.andExpect(jsonPath("$.code").value("INVALID_PAGE_SIZE"));
	}

	@Test
	void invalidSortReturnsProblemDetail() throws Exception {
		DepartmentReportQuery query = new DepartmentReportQuery(null, null, "manager,asc", null, null);
		when(departmentReportService.getDepartmentsReport(query))
				.thenThrow(new InvalidReportQueryException(
						ErrorCode.INVALID_SORT,
						"unsupported sort field: manager"));

		mockMvc.perform(get("/api/reports/departments").param("sort", "manager,asc"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Invalid report query"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("unsupported sort field: manager"))
				.andExpect(jsonPath("$.code").value("INVALID_SORT"));
	}

	private static PagedResponse<DepartmentReportRow> responseWithEngineering() {
		return new PagedResponse<>(
				List.of(new DepartmentReportRow(100L, "Engineering", "Alice Chen", 2L, "Toronto")),
				new PageMetadata(0, 25, 1, 1, false, false));
	}
}
