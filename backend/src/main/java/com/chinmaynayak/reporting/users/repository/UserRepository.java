package com.chinmaynayak.reporting.users.repository;

import com.chinmaynayak.reporting.users.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
}
