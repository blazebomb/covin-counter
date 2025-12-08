package com.example.covid_counter.service;

import com.example.covid_counter.model.DayWise;
import com.example.covid_counter.repo.DayWiseRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DayWiseService {

    private final DayWiseRepo repo;

    public DayWiseService(DayWiseRepo repo) {
        this.repo = repo;
    }

    /**
     * Fetch all day-wise rows, optionally filtering by date prefix (e.g., "2020-03").
     */
    public List<DayWise> getAll(String datePrefix) {
        boolean hasDate = datePrefix != null && !datePrefix.isBlank();
        if (hasDate) {
            return repo.findByDateStartingWith(datePrefix);
        }
        return repo.findAll();
    }

    /**
     * Update a single day row by date.
     */
    public DayWise updateByDate(String date, DayWise updated) {
        DayWise existing = repo.findById(date)
                .orElseThrow(() -> new EntityNotFoundException("Record not found for date: " + date));

        existing.setDate(date);
        existing.setConfirmed(updated.getConfirmed());
        existing.setDeaths(updated.getDeaths());
        existing.setRecovered(updated.getRecovered());
        existing.setActive(updated.getActive());
        existing.setNewCases(updated.getNewCases());
        existing.setNewDeaths(updated.getNewDeaths());
        existing.setNewRecovered(updated.getNewRecovered());
        existing.setDeathsPer100Cases(updated.getDeathsPer100Cases());
        existing.setRecoveredPer100Cases(updated.getRecoveredPer100Cases());
        existing.setDeathsPer100Recovered(updated.getDeathsPer100Recovered());
        existing.setNumberOfCountries(updated.getNumberOfCountries());

        return repo.save(existing);
    }
}
