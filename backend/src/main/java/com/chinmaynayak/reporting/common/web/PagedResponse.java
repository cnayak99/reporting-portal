package com.chinmaynayak.reporting.common.web;

import java.util.List;
import java.util.Objects;

public record PagedResponse<T>(
		List<T> items,
		PageMetadata pagination) {

	public PagedResponse {
		items = List.copyOf(items);
		Objects.requireNonNull(pagination, "pagination must not be null");
	}
}
