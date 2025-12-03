package com.example.covid_counter.repo;

import com.example.covid_counter.model.CountryWiseLatest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CountryWiseLatestRepo extends JpaRepository<CountryWiseLatest, String> {

    List<CountryWiseLatest> findByWhoRegion(String whoRegion);

    List<CountryWiseLatest> findByActiveLessThan(Long active);

    List<CountryWiseLatest> findByActiveGreaterThan(Long active);

    List<CountryWiseLatest> findByRecovered(Long recovered);
}
