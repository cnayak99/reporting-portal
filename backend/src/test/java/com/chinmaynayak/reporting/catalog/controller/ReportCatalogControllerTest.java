package com.chinmaynayak.reporting.catalog.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chinmaynayak.reporting.catalog.dto.ReportMetadata;
import com.chinmaynayak.reporting.catalog.service.ReportCatalogService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ReportCatalogController.class)
class ReportCatalogControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private ReportCatalogService reportCatalogService;

	@Test
	void getReportsReturnsCatalogMetadata() throws Exception {
		when(reportCatalogService.getReports()).thenReturn(reportMetadata());

		mockMvc.perform(get("/api/reports"))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.length()").value(3))
				.andExpect(jsonPath("$[0].id").value("users"))
				.andExpect(jsonPath("$[0].name").value("Users"))
				.andExpect(jsonPath("$[0].description").value("User identity, contact, role, status, and created date."))
				.andExpect(jsonPath("$[0].endpoint").value("/api/reports/users"))
				.andExpect(jsonPath("$[1].id").value("departments"))
				.andExpect(jsonPath("$[1].name").value("Departments"))
				.andExpect(jsonPath("$[1].description").value("Department names, managers, employee counts, and locations."))
				.andExpect(jsonPath("$[1].endpoint").value("/api/reports/departments"))
				.andExpect(jsonPath("$[2].id").value("projects"))
				.andExpect(jsonPath("$[2].name").value("Projects"))
				.andExpect(jsonPath("$[2].description").value("Project ownership, department, status, and schedule dates."))
				.andExpect(jsonPath("$[2].endpoint").value("/api/reports/projects"));

		verify(reportCatalogService).getReports();
	}

	private static List<ReportMetadata> reportMetadata() {
		return List.of(
				new ReportMetadata(
						"users",
						"Users",
						"User identity, contact, role, status, and created date.",
						"/api/reports/users"),
				new ReportMetadata(
						"departments",
						"Departments",
						"Department names, managers, employee counts, and locations.",
						"/api/reports/departments"),
				new ReportMetadata(
						"projects",
						"Projects",
						"Project ownership, department, status, and schedule dates.",
						"/api/reports/projects"));
	}
}
