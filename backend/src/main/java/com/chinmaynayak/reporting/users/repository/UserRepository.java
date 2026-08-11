package com.chinmaynayak.reporting.users.repository;

import com.chinmaynayak.reporting.users.domain.UserEntity;
import com.chinmaynayak.reporting.users.domain.UserRole;
import com.chinmaynayak.reporting.users.domain.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

	@Query(value = """
			SELECT u
			FROM UserEntity u
			WHERE (:searchPattern IS NULL
				OR lower(u.fullName) LIKE :searchPattern
				OR lower(u.email) LIKE :searchPattern)
			  AND (:role IS NULL OR u.role = :role)
			  AND (:status IS NULL OR u.status = :status)
			""",
			countQuery = """
					SELECT count(u)
					FROM UserEntity u
					WHERE (:searchPattern IS NULL
						OR lower(u.fullName) LIKE :searchPattern
						OR lower(u.email) LIKE :searchPattern)
					  AND (:role IS NULL OR u.role = :role)
					  AND (:status IS NULL OR u.status = :status)
					""")
	Page<UserEntity> search(
			@Param("searchPattern") String searchPattern,
			@Param("role") UserRole role,
			@Param("status") UserStatus status,
			Pageable pageable);
}
