package com.example.covid_counter.repo;

import com.example.covid_counter.model.WorldometerData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorldometerDataRepo extends JpaRepository<WorldometerData, String> {

    // Find by country prefix (case-insensitive) for quick search-as-you-type.
    List<WorldometerData> findByCountryRegionStartingWithIgnoreCase(String countryRegion);

    // Find by continent prefix (case-insensitive).
    List<WorldometerData> findByContinentStartingWithIgnoreCase(String continent);

    // Combined filter: country AND continent prefixes.
    List<WorldometerData> findByCountryRegionStartingWithIgnoreCaseAndContinentStartingWithIgnoreCase(
            String countryRegion, String continent);
}
