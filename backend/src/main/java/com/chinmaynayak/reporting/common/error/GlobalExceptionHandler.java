package com.chinmaynayak.reporting.common.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(InvalidReportQueryException.class)
	ProblemDetail handleInvalidReportQuery(InvalidReportQueryException exception) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
		problem.setTitle("Invalid report query");
		problem.setProperty("code", exception.getCode().name());
		return problem;
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	ProblemDetail handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException exception) {
		String parameterName = exception.getName();
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(
				HttpStatus.BAD_REQUEST,
				"Invalid value for parameter '" + parameterName + "'.");
		problem.setTitle("Invalid request parameter");
		problem.setProperty("code", ErrorCode.INVALID_PARAMETER.name());
		problem.setProperty("parameter", parameterName);
		return problem;
	}
}
