package com.example.covid_counter.repo;

import com.example.covid_counter.model.CovidDataSimple;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CovidDataSimpleRepo extends JpaRepository<CovidDataSimple, Long> {

    List<CovidDataSimple> findByCountryStartingWithIgnoreCase(String countryPrefix);

    List<CovidDataSimple> findByRegionStartingWithIgnoreCase(String regionPrefix);
}
