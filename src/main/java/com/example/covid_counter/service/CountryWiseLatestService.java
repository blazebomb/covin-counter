package com.example.covid_counter.service;

import com.example.covid_counter.model.CountryWiseLatest;
import com.example.covid_counter.repo.CountryWiseLatestRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CountryWiseLatestService {

    private final CountryWiseLatestRepo repo;

    public CountryWiseLatestService(CountryWiseLatestRepo repo) {
        this.repo = repo;
    }

    public List<CountryWiseLatest> getAll() {
        return repo.findAll();
    }

    public CountryWiseLatest getByCountry(String country) {
        return repo.findById(country)
                .orElseThrow(() -> new EntityNotFoundException("Record not found for country: " + country));
    }

    public List<CountryWiseLatest> getByWhoRegion(String whoRegion) {
        return repo.findByWhoRegion(whoRegion);
    }

    public List<CountryWiseLatest> getByActiveLessThan(Long activeCount) {
        return repo.findByActiveLessThan(activeCount);
    }

    public List<CountryWiseLatest> getByActiveGreaterThan(Long activeCount) {
        return repo.findByActiveGreaterThan(activeCount);
    }



    @Transactional
    public CountryWiseLatest updateByCountry(String country, CountryWiseLatest updated) {
        CountryWiseLatest existing = getByCountry(country);

        // keep country/region identifier unchanged
        existing.setCountryRegion(country);
        existing.setConfirmed(updated.getConfirmed());
        existing.setDeaths(updated.getDeaths());
        existing.setActive(updated.getActive());
        existing.setRecovered(updated.getRecovered());
        existing.setNewCases(updated.getNewCases());
        existing.setNewDeaths(updated.getNewDeaths());
        existing.setNewRecovered(updated.getNewRecovered());
        existing.setDeathsPer100Cases(updated.getDeathsPer100Cases());
        existing.setRecoveredPer100Cases(updated.getRecoveredPer100Cases());
        existing.setDeathsPer100Recovered(updated.getDeathsPer100Recovered());
        existing.setConfirmedLastWeek(updated.getConfirmedLastWeek());
        existing.setOneWeekChange(updated.getOneWeekChange());
        existing.setOneWeekPercentIncrease(updated.getOneWeekPercentIncrease());
        existing.setWhoRegion(updated.getWhoRegion());

        return repo.save(existing);
    }


    @Transactional
    public CountryWiseLatest updateRecovered(String country){
        CountryWiseLatest existing = getByCountry(country);

        long confirmed  = existing.getConfirmed() == null ? 0 : existing.getConfirmed();
        long deaths     = existing.getDeaths() == null ? 0 : existing.getDeaths();
        long active     = existing.getActive() == null ? 0 : existing.getActive();
        long recovered  = confirmed - deaths - active;

        existing.setRecovered(Math.max(0, recovered));
        return repo.save(existing);
    }
}
