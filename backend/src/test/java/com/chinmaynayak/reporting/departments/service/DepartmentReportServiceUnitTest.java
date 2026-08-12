package com.chinmaynayak.reporting.departments.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chinmaynayak.reporting.departments.dto.DepartmentReportQuery;
import com.chinmaynayak.reporting.departments.repository.DepartmentRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class DepartmentReportServiceUnitTest {

	@Test
	void nameSortIncludesIdTieBreaker() {
		DepartmentRepository departmentRepository = mock(DepartmentRepository.class);
		when(departmentRepository.searchReport(isNull(), isNull(), any(Pageable.class))).thenReturn(Page.empty());
		DepartmentReportService departmentReportService = new DepartmentReportService(departmentRepository);

		departmentReportService.getDepartmentsReport(new DepartmentReportQuery(null, null, "name,asc", null, null));

		ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
		verify(departmentRepository).searchReport(isNull(), isNull(), pageableCaptor.capture());

		assertThat(pageableCaptor.getValue().getSort()).containsExactly(
				Sort.Order.asc("name"),
				Sort.Order.asc("id"));
	}
}
