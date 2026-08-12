package com.chinmaynayak.reporting.projects.service;

import com.chinmaynayak.reporting.common.error.ErrorCode;
import com.chinmaynayak.reporting.common.error.InvalidReportQueryException;
import com.chinmaynayak.reporting.common.web.PageMetadata;
import com.chinmaynayak.reporting.common.web.PagedResponse;
import com.chinmaynayak.reporting.projects.dto.ProjectReportQuery;
import com.chinmaynayak.reporting.projects.dto.ProjectReportRow;
import com.chinmaynayak.reporting.projects.repository.ProjectRepository;
import java.util.Locale;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectReportService {

	private static final int DEFAULT_PAGE = 0;
	private static final int DEFAULT_SIZE = 25;
	private static final int MAX_SIZE = 100;
	private static final String DEFAULT_SORT = "name,asc";
	private static final Map<String, String> SORT_FIELDS = Map.of(
			"id", "id",
			"name", "name",
			"status", "status",
			"startDate", "startDate",
			"endDate", "endDate");

	private final ProjectRepository projectRepository;

	public ProjectReportService(ProjectRepository projectRepository) {
		this.projectRepository = projectRepository;
	}

	@Transactional(readOnly = true)
	public PagedResponse<ProjectReportRow> getProjectsReport(ProjectReportQuery query) {
		ProjectReportQuery safeQuery = query == null ? ProjectReportQuery.defaults() : query;
		Pageable pageable = buildPageable(safeQuery);
		String searchPattern = toSearchPattern(normalizeSearch(safeQuery.q()));
		Long departmentId = validateDepartmentId(safeQuery.departmentId());

		Page<ProjectReportRow> projects = projectRepository.searchReport(
				searchPattern,
				safeQuery.status(),
				departmentId,
				pageable);

		return new PagedResponse<>(projects.getContent(), toMetadata(projects));
	}

	private Pageable buildPageable(ProjectReportQuery query) {
		int page = query.page() == null ? DEFAULT_PAGE : query.page();
		int size = query.size() == null ? DEFAULT_SIZE : query.size();

		if (page < 0) {
			throw new InvalidReportQueryException(ErrorCode.INVALID_PAGE, "page must be greater than or equal to 0");
		}

		if (size < 1 || size > MAX_SIZE) {
			throw new InvalidReportQueryException(ErrorCode.INVALID_PAGE_SIZE, "size must be between 1 and 100");
		}

		return PageRequest.of(page, size, buildSort(query.sort()));
	}

	private Sort buildSort(String rawSort) {
		String sortValue = normalizeSort(rawSort);
		String[] parts = sortValue.split(",", -1);

		if (parts.length != 2) {
			throw new InvalidReportQueryException(ErrorCode.INVALID_SORT, "sort must use the format field,direction");
		}

		String apiField = parts[0].trim();
		String directionValue = parts[1].trim();
		String entityField = SORT_FIELDS.get(apiField);

		if (entityField == null) {
			throw new InvalidReportQueryException(ErrorCode.INVALID_SORT, "unsupported sort field: " + apiField);
		}

		Sort.Direction direction = parseDirection(directionValue);
		Sort.Order primaryOrder = Sort.Order.by(entityField).with(direction);

		if ("endDate".equals(apiField)) {
			primaryOrder = primaryOrder.nullsLast();
		}

		Sort sort = Sort.by(primaryOrder);

		if (!"id".equals(apiField)) {
			sort = sort.and(Sort.by(Sort.Direction.ASC, "id"));
		}

		return sort;
	}

	private String normalizeSort(String rawSort) {
		if (rawSort == null || rawSort.isBlank()) {
			return DEFAULT_SORT;
		}

		return rawSort.trim();
	}

	private Sort.Direction parseDirection(String directionValue) {
		if ("asc".equalsIgnoreCase(directionValue)) {
			return Sort.Direction.ASC;
		}

		if ("desc".equalsIgnoreCase(directionValue)) {
			return Sort.Direction.DESC;
		}

		throw new InvalidReportQueryException(ErrorCode.INVALID_SORT, "sort direction must be asc or desc");
	}

	private static String normalizeSearch(String q) {
		if (q == null || q.isBlank()) {
			return null;
		}

		return q.trim();
	}

	private static String toSearchPattern(String normalizedSearch) {
		if (normalizedSearch == null) {
			return null;
		}

		return "%" + normalizedSearch.toLowerCase(Locale.ROOT) + "%";
	}

	private static Long validateDepartmentId(Long departmentId) {
		if (departmentId == null) {
			return null;
		}

		if (departmentId <= 0) {
			throw new InvalidReportQueryException(ErrorCode.INVALID_PARAMETER, "departmentId must be greater than 0");
		}

		return departmentId;
	}

	private static PageMetadata toMetadata(Page<ProjectReportRow> page) {
		return new PageMetadata(
				page.getNumber(),
				page.getSize(),
				page.getTotalElements(),
				page.getTotalPages(),
				page.hasNext(),
				page.hasPrevious());
	}
}
