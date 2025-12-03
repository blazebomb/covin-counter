package com.example.covid_counter.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.covid_counter.model.UsersModel;

@Repository
public interface UsersRepo extends JpaRepository<UsersModel, Long> {
    Optional<UsersModel> findByEmail(String email);
}
