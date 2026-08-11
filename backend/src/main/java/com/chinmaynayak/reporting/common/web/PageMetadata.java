package com.chinmaynayak.reporting.common.web;

public record PageMetadata(
		int page,
		int size,
		long totalItems,
		int totalPages,
		boolean hasNext,
		boolean hasPrevious) {
}
