package com.chinmaynayak.reporting.common.error;

public class InvalidReportQueryException extends RuntimeException {

	private final ErrorCode code;

	public InvalidReportQueryException(ErrorCode code, String message) {
		super(message);
		this.code = code;
	}

	public ErrorCode getCode() {
		return code;
	}
}
