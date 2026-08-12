package com.chinmaynayak.reporting.users.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chinmaynayak.reporting.common.web.PageMetadata;
import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;
import com.chinmaynayak.reporting.users.dto.UserReportQuery;
import com.chinmaynayak.reporting.users.dto.UserReportRow;
import com.chinmaynayak.reporting.users.service.UserReportService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserReportController.class)
class UserReportControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private UserReportService userReportService;

	@Test
	void getUsersReportReturnsOkWithItemsAndPagination() throws Exception {
		when(userReportService.getUsersReport(any())).thenReturn(responseWithAlice());

		mockMvc.perform(get("/api/reports/users"))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.items[0].id").value(200))
				.andExpect(jsonPath("$.items[0].name").value("Alice Chen"))
				.andExpect(jsonPath("$.items[0].email").value("alice.chen@example.com"))
				.andExpect(jsonPath("$.items[0].role").value("MANAGER"))
				.andExpect(jsonPath("$.items[0].status").value("ACTIVE"))
				.andExpect(jsonPath("$.items[0].createdAt").value("2026-01-15T14:30:00Z"))
				.andExpect(jsonPath("$.pagination.page").value(0))
				.andExpect(jsonPath("$.pagination.size").value(25))
				.andExpect(jsonPath("$.pagination.totalItems").value(1))
				.andExpect(jsonPath("$.pagination.totalPages").value(1))
				.andExpect(jsonPath("$.pagination.hasNext").value(false))
				.andExpect(jsonPath("$.pagination.hasPrevious").value(false));

		verify(userReportService).getUsersReport(UserReportQuery.defaults());
	}

	@Test
	void forwardsSupportedQueryParameters() throws Exception {
		when(userReportService.getUsersReport(any())).thenReturn(emptyResponse());

		mockMvc.perform(get("/api/reports/users")
						.param("page", "2")
						.param("size", "10")
						.param("sort", "createdAt,desc")
						.param("q", "alice")
						.param("role", "MANAGER")
						.param("status", "ACTIVE"))
				.andExpect(status().isOk());

		ArgumentCaptor<UserReportQuery> queryCaptor = ArgumentCaptor.forClass(UserReportQuery.class);
		verify(userReportService).getUsersReport(queryCaptor.capture());

		assertThat(queryCaptor.getValue()).isEqualTo(new UserReportQuery(
				2,
				10,
				"createdAt,desc",
				"alice",
				UserRole.MANAGER,
				UserStatus.ACTIVE));
	}

	@Test
	void invalidEnumValuesReturnBadRequest() throws Exception {
		mockMvc.perform(get("/api/reports/users").param("role", "LEAD"))
				.andExpect(status().isBadRequest());

		mockMvc.perform(get("/api/reports/users").param("status", "PENDING"))
				.andExpect(status().isBadRequest());

		verifyNoInteractions(userReportService);
	}

	@Test
	void emptyServiceResultReturnsOkWithEmptyItems() throws Exception {
		when(userReportService.getUsersReport(any())).thenReturn(emptyResponse());

		mockMvc.perform(get("/api/reports/users"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items").isArray())
				.andExpect(jsonPath("$.items").isEmpty())
				.andExpect(jsonPath("$.pagination.totalItems").value(0))
				.andExpect(jsonPath("$.pagination.totalPages").value(0));
	}

	private static PagedResponse<UserReportRow> responseWithAlice() {
		UserReportRow alice = new UserReportRow(
				200L,
				"Alice Chen",
				"alice.chen@example.com",
				UserRole.MANAGER,
				UserStatus.ACTIVE,
				Instant.parse("2026-01-15T14:30:00Z"));

		return new PagedResponse<>(
				List.of(alice),
				new PageMetadata(0, 25, 1, 1, false, false));
	}

	private static PagedResponse<UserReportRow> emptyResponse() {
		return new PagedResponse<>(
				List.of(),
				new PageMetadata(0, 25, 0, 0, false, false));
	}
}
