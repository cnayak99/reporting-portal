package com.chinmaynayak.reporting.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
		info = @Info(
				title = "Reporting Portal API",
				version = "v1",
				description = "Read-only reporting API for users, departments, projects, and report catalog metadata."))
public class OpenApiConfig {
}
