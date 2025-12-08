package com.example.covid_counter.service;

import com.example.covid_counter.model.WorldometerData;
import com.example.covid_counter.repo.WorldometerDataRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorldometerDataService {

    private final WorldometerDataRepo repo;

    public WorldometerDataService(WorldometerDataRepo repo) {
        this.repo = repo;
    }

    /**
     * Fetch all rows with optional prefix filters for country and continent.
     * If no filters are provided, returns all rows.
     */
    public List<WorldometerData> getAll(String countryPrefix, String continentPrefix) {
        boolean hasCountry = countryPrefix != null && !countryPrefix.isBlank();
        boolean hasContinent = continentPrefix != null && !continentPrefix.isBlank();

        if (hasCountry && hasContinent) {
            return repo.findByCountryRegionStartingWithIgnoreCaseAndContinentStartingWithIgnoreCase(
                    countryPrefix, continentPrefix);
        } else if (hasCountry) {
            return repo.findByCountryRegionStartingWithIgnoreCase(countryPrefix);
        } else if (hasContinent) {
            return repo.findByContinentStartingWithIgnoreCase(continentPrefix);
        }
        return repo.findAll(); // no filters
    }

    /**
     * Update a row by country (acts as the ID).
     */
    public WorldometerData updateByCountry(String country, WorldometerData updated) {
        WorldometerData existing = repo.findById(country)
                .orElseThrow(() -> new EntityNotFoundException("Record not found for country: " + country));

        // Keep ID stable
        existing.setCountryRegion(country);

        existing.setContinent(updated.getContinent());
        existing.setPopulation(updated.getPopulation());
        existing.setTotalCases(updated.getTotalCases());
        existing.setNewCases(updated.getNewCases());
        existing.setTotalDeaths(updated.getTotalDeaths());
        existing.setNewDeaths(updated.getNewDeaths());
        existing.setTotalRecovered(updated.getTotalRecovered());
        existing.setNewRecovered(updated.getNewRecovered());
        existing.setActiveCases(updated.getActiveCases());
        existing.setSeriousCritical(updated.getSeriousCritical());
        existing.setTotCasesPer1Mpop(updated.getTotCasesPer1Mpop());
        existing.setDeathsPer1Mpop(updated.getDeathsPer1Mpop());
        existing.setTotalTests(updated.getTotalTests());
        existing.setTestsPer1Mpop(updated.getTestsPer1Mpop());
        existing.setWhoRegion(updated.getWhoRegion());

        return repo.save(existing);
    }
}
