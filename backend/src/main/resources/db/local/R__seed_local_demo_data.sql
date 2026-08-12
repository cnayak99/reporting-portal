-- Local-only demo data for development and frontend demos.
-- These fictional records are not ENFOS office locations or employees.
-- Stable IDs define the owned demo rows; name/email unique indexes still fail loudly on unrelated collisions.

INSERT INTO departments (id, name, location, manager_user_id, created_at, updated_at)
VALUES
    (1001, 'Engineering', 'San Francisco, CA', NULL, '2026-01-01T09:00:00Z', '2026-01-01T09:00:00Z'),
    (1002, 'Product', 'Durham, NC', NULL, '2026-01-01T09:00:00Z', '2026-01-01T09:00:00Z'),
    (1003, 'Operations', 'Chicago, IL', NULL, '2026-01-01T09:00:00Z', '2026-01-01T09:00:00Z'),
    (1004, 'Finance', 'New York, NY', NULL, '2026-01-01T09:00:00Z', '2026-01-01T09:00:00Z'),
    (1005, 'Legal & Compliance', 'Austin, TX', NULL, '2026-01-01T09:00:00Z', '2026-01-01T09:00:00Z'),
    (1006, 'Customer Success', 'Denver, CO', NULL, '2026-01-01T09:00:00Z', '2026-01-01T09:00:00Z'),
    (1007, 'Data & Analytics', 'Seattle, WA', NULL, '2026-01-01T09:00:00Z', '2026-01-01T09:00:00Z')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    location = EXCLUDED.location,
    manager_user_id = NULL,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

INSERT INTO users (id, full_name, email, role, status, department_id, created_at, updated_at)
VALUES
    (2001, 'Alice Chen', 'alice.chen@reporting.example', 'MANAGER', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2002, 'Liam Carter', 'liam.carter@reporting.example', 'ENGINEER', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2003, 'Maya Brooks', 'maya.brooks@reporting.example', 'ENGINEER', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2004, 'Ethan Nguyen', 'ethan.nguyen@reporting.example', 'ENGINEER', 'ON_LEAVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2005, 'Sofia Martinez', 'sofia.martinez@reporting.example', 'ANALYST', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2006, 'Noah Wilson', 'noah.wilson@reporting.example', 'ENGINEER', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2007, 'Hannah Kim', 'hannah.kim@reporting.example', 'ENGINEER', 'INACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2008, 'Daniel Park', 'daniel.park@reporting.example', 'ADMIN', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2009, 'Grace Lee', 'grace.lee@reporting.example', 'ENGINEER', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2010, 'Victor Chen', 'victor.chen@reporting.example', 'ANALYST', 'ACTIVE', 1001, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2011, 'Priya Shah', 'priya.shah@reporting.example', 'MANAGER', 'ACTIVE', 1002, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2012, 'Jordan Taylor', 'jordan.taylor@reporting.example', 'ANALYST', 'ACTIVE', 1002, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2013, 'Chloe Bennett', 'chloe.bennett@reporting.example', 'ANALYST', 'ON_LEAVE', 1002, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2014, 'Ryan Cooper', 'ryan.cooper@reporting.example', 'ENGINEER', 'ACTIVE', 1002, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2015, 'Amara Okafor', 'amara.okafor@reporting.example', 'OPERATIONS', 'ACTIVE', 1002, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2016, 'Lucas Wright', 'lucas.wright@reporting.example', 'ANALYST', 'INACTIVE', 1002, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2017, 'Marcus Reed', 'marcus.reed@reporting.example', 'MANAGER', 'ACTIVE', 1003, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2018, 'Olivia Morgan', 'olivia.morgan@reporting.example', 'OPERATIONS', 'ACTIVE', 1003, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2019, 'Caleb Brooks', 'caleb.brooks@reporting.example', 'OPERATIONS', 'ACTIVE', 1003, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2020, 'Zoe Rivera', 'zoe.rivera@reporting.example', 'OPERATIONS', 'ON_LEAVE', 1003, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2021, 'Samuel Price', 'samuel.price@reporting.example', 'ANALYST', 'ACTIVE', 1003, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2022, 'Mia Torres', 'mia.torres@reporting.example', 'OPERATIONS', 'INACTIVE', 1003, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2023, 'Nina Patel', 'nina.patel@reporting.example', 'MANAGER', 'ACTIVE', 1004, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2024, 'Henry Adams', 'henry.adams@reporting.example', 'ANALYST', 'ACTIVE', 1004, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2025, 'Layla Scott', 'layla.scott@reporting.example', 'ANALYST', 'ACTIVE', 1004, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2026, 'Owen Murphy', 'owen.murphy@reporting.example', 'ADMIN', 'ACTIVE', 1004, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2027, 'Clara Evans', 'clara.evans@reporting.example', 'ANALYST', 'INACTIVE', 1004, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2028, 'Elena Garcia', 'elena.garcia@reporting.example', 'MANAGER', 'ACTIVE', 1006, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2029, 'Isaac Turner', 'isaac.turner@reporting.example', 'OPERATIONS', 'ACTIVE', 1006, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2030, 'Ava Robinson', 'ava.robinson@reporting.example', 'OPERATIONS', 'ACTIVE', 1006, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2031, 'Ben Foster', 'ben.foster@reporting.example', 'ANALYST', 'ON_LEAVE', 1006, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2032, 'Naomi Hughes', 'naomi.hughes@reporting.example', 'OPERATIONS', 'ACTIVE', 1006, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2033, 'Leo Simmons', 'leo.simmons@reporting.example', 'OPERATIONS', 'INACTIVE', 1006, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2034, 'Omar Hassan', 'omar.hassan@reporting.example', 'MANAGER', 'ACTIVE', 1007, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2035, 'Sarah Collins', 'sarah.collins@reporting.example', 'ANALYST', 'ACTIVE', 1007, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2036, 'Diego Ramirez', 'diego.ramirez@reporting.example', 'ENGINEER', 'ACTIVE', 1007, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2037, 'Emily Ward', 'emily.ward@reporting.example', 'ANALYST', 'ACTIVE', 1007, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2038, 'Julian Brooks', 'julian.brooks@reporting.example', 'ENGINEER', 'ON_LEAVE', 1007, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2039, 'Fatima Ali', 'fatima.ali@reporting.example', 'ANALYST', 'ACTIVE', 1007, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z'),
    (2040, 'Aaron Miller', 'aaron.miller@reporting.example', 'ENGINEER', 'INACTIVE', 1007, '2026-01-02T09:00:00Z', '2026-01-02T09:00:00Z')
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    department_id = EXCLUDED.department_id,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

UPDATE departments
SET manager_user_id = CASE id
    WHEN 1001 THEN 2001
    WHEN 1002 THEN 2011
    WHEN 1003 THEN 2017
    WHEN 1004 THEN 2023
    WHEN 1006 THEN 2028
    WHEN 1007 THEN 2034
    ELSE NULL
END,
updated_at = '2026-01-03T09:00:00Z'
WHERE id IN (1001, 1002, 1003, 1004, 1005, 1006, 1007);

INSERT INTO projects (id, name, department_id, owner_user_id, status, start_date, end_date, created_at, updated_at)
VALUES
    (3001, 'API Modernization', 1001, 2001, 'ACTIVE', '2026-01-15', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3002, 'Frontend Reporting Portal', 1001, 2002, 'ACTIVE', '2026-02-01', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3003, 'Data Pipeline Refresh', 1007, 2034, 'ACTIVE', '2026-01-05', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3004, 'Quarterly Forecast Model', 1004, 2023, 'PLANNED', '2026-05-01', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3005, 'Customer Health Dashboard', 1006, 2028, 'ACTIVE', '2026-03-10', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3006, 'Incident Response Automation', 1003, 2017, 'ON_HOLD', '2026-02-20', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3007, 'Subscription Billing Review', 1004, 2024, 'COMPLETED', '2025-09-01', '2026-01-31', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3008, 'Mobile Field Experience', 1002, 2011, 'PLANNED', '2026-06-01', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3009, 'Security Access Review', 1001, 2008, 'COMPLETED', '2025-10-15', '2026-02-28', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3010, 'Support Knowledge Base', 1006, 2030, 'ACTIVE', '2026-01-20', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3011, 'Warehouse Cost Analysis', 1007, 2035, 'COMPLETED', '2025-07-01', '2025-12-15', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3012, 'Procurement Workflow Cleanup', 1003, 2018, 'CANCELLED', '2025-11-01', '2026-01-10', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3013, 'Product Usage Insights', 1002, 2012, 'ACTIVE', '2026-02-15', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3014, 'Audit Evidence Tracker', 1004, 2027, 'ON_HOLD', '2026-03-01', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3015, 'Deployment Reliability Program', 1001, 2003, 'ACTIVE', '2026-01-12', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3016, 'Regional Operations Playbook', 1003, 2019, 'COMPLETED', '2025-08-01', '2025-12-20', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3017, 'Executive Metrics Pack', 1007, 2037, 'ACTIVE', '2026-02-01', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3018, 'Customer Onboarding Journey', 1006, 2032, 'PLANNED', '2026-04-15', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3019, 'Performance Test Harness', 1001, 2006, 'COMPLETED', '2025-06-01', '2025-11-30', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3020, 'Revenue Recognition Cleanup', 1004, 2025, 'ACTIVE', '2026-01-25', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3021, 'Release Planning Board', 1002, 2014, 'ACTIVE', '2026-03-05', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3022, 'Field Escalation Routing', 1006, 2029, 'ON_HOLD', '2026-02-18', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3023, 'Operations Capacity Planner', 1003, 2020, 'PLANNED', '2026-05-10', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3024, 'Analytics Quality Monitor', 1007, 2039, 'ACTIVE', '2026-01-30', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3025, 'Legacy Portal Retirement', 1001, 2009, 'CANCELLED', '2025-09-10', '2025-12-01', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3026, 'Pricing Experiment Toolkit', 1002, 2015, 'COMPLETED', '2025-04-15', '2025-10-01', '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3027, 'Cloud Spend Governance', 1004, 2026, 'ACTIVE', '2026-02-10', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3028, 'Customer Renewal Signals', 1006, 2031, 'PLANNED', '2026-06-15', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3029, 'Search Relevance Tuning', 1007, 2036, 'ON_HOLD', '2026-02-22', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z'),
    (3030, 'Engineering Hiring Plan', 1001, 2001, 'PLANNED', '2026-07-01', NULL, '2026-01-04T09:00:00Z', '2026-01-04T09:00:00Z')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    department_id = EXCLUDED.department_id,
    owner_user_id = EXCLUDED.owner_user_id,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

SELECT setval(pg_get_serial_sequence('departments', 'id'), COALESCE((SELECT MAX(id) FROM departments), 1), true);
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE((SELECT MAX(id) FROM projects), 1), true);
