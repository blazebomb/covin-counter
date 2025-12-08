package com.example.covid_counter.service;

import com.example.covid_counter.model.CovidDataSimple;
import com.example.covid_counter.repo.CovidDataSimpleRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CovidDataSimpleService {

    private final CovidDataSimpleRepo repo;

    public CovidDataSimpleService(CovidDataSimpleRepo repo) {
        this.repo = repo;
    }

    /**
     * Filter by region or continent (both mapped to the Region column).
     */
    public List<CovidDataSimple> getAll(String countryPrefix, String regionPrefix, String continentPrefix) {
        if (countryPrefix != null && !countryPrefix.isBlank()) {
            return repo.findByCountryStartingWithIgnoreCase(countryPrefix);
        }

        String filter = firstNonBlank(regionPrefix, continentPrefix);
        if (filter != null) {
            return repo.findByRegionStartingWithIgnoreCase(filter);
        }
        return repo.findAll();
    }

    /**
     * Update a row by record_id.
     */
    public CovidDataSimple update(Long id, CovidDataSimple payload) {
        CovidDataSimple existing = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found: " + id));

        existing.setCountry(payload.getCountry());
        existing.setLatitude(payload.getLatitude());
        existing.setLongitude(payload.getLongitude());
        existing.setTotalCases(payload.getTotalCases());
        existing.setTotalDeaths(payload.getTotalDeaths());
        existing.setTotalRecovered(payload.getTotalRecovered());
        existing.setActiveCases(payload.getActiveCases());
        existing.setRegion(payload.getRegion());
        existing.setCasesPerMillion(payload.getCasesPerMillion());
        existing.setDeathsPerMillion(payload.getDeathsPerMillion());

        return repo.save(existing);
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }
}
