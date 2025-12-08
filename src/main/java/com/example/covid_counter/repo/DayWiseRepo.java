package com.example.covid_counter.repo;

import com.example.covid_counter.model.DayWise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DayWiseRepo extends JpaRepository<DayWise, String> {

    List<DayWise> findByDateStartingWith(String datePrefix);
}
