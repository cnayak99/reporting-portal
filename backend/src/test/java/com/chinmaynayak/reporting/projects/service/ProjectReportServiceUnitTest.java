package com.chinmaynayak.reporting.projects.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chinmaynayak.reporting.common.error.ErrorCode;
import com.chinmaynayak.reporting.common.error.InvalidReportQueryException;
import com.chinmaynayak.reporting.projects.dto.ProjectReportQuery;
import com.chinmaynayak.reporting.projects.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class ProjectReportServiceUnitTest {

	@Test
	void nameSortIncludesIdTieBreaker() {
		ProjectRepository projectRepository = mock(ProjectRepository.class);
		when(projectRepository.searchReport(isNull(), isNull(), isNull(), any(Pageable.class))).thenReturn(Page.empty());
		ProjectReportService projectReportService = new ProjectReportService(projectRepository);

		projectReportService.getProjectsReport(new ProjectReportQuery(null, null, "name,asc", null, null, null));

		ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
		verify(projectRepository).searchReport(isNull(), isNull(), isNull(), pageableCaptor.capture());

		assertThat(pageableCaptor.getValue().getSort()).containsExactly(
				Sort.Order.asc("name"),
				Sort.Order.asc("id"));
	}

	@Test
	void endDateSortRequestsNullsLast() {
		ProjectRepository projectRepository = mock(ProjectRepository.class);
		when(projectRepository.searchReport(isNull(), isNull(), isNull(), any(Pageable.class))).thenReturn(Page.empty());
		ProjectReportService projectReportService = new ProjectReportService(projectRepository);

		projectReportService.getProjectsReport(new ProjectReportQuery(null, null, "endDate,desc", null, null, null));

		ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
		verify(projectRepository).searchReport(isNull(), isNull(), isNull(), pageableCaptor.capture());

		assertThat(pageableCaptor.getValue().getSort()).containsExactly(
				Sort.Order.desc("endDate").nullsLast(),
				Sort.Order.asc("id"));
	}

	@Test
	void rejectsNonPositiveDepartmentId() {
		ProjectRepository projectRepository = mock(ProjectRepository.class);
		ProjectReportService projectReportService = new ProjectReportService(projectRepository);

		ProjectReportQuery zero = new ProjectReportQuery(null, null, null, null, null, 0L);
		ProjectReportQuery negative = new ProjectReportQuery(null, null, null, null, null, -5L);

		assertThatThrownBy(() -> projectReportService.getProjectsReport(zero))
				.isInstanceOfSatisfying(InvalidReportQueryException.class, exception -> {
					assertThat(exception.getCode()).isEqualTo(ErrorCode.INVALID_PARAMETER);
					assertThat(exception).hasMessage("departmentId must be greater than 0");
				});
		assertThatThrownBy(() -> projectReportService.getProjectsReport(negative))
				.isInstanceOfSatisfying(InvalidReportQueryException.class, exception -> {
					assertThat(exception.getCode()).isEqualTo(ErrorCode.INVALID_PARAMETER);
					assertThat(exception).hasMessage("departmentId must be greater than 0");
				});
	}
}
