package com.example.covid_counter.controller;

import com.example.covid_counter.model.CountryWiseLatest;
import com.example.covid_counter.service.CountryWiseLatestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/countries")
public class CountryWiseLatestController {

    private final CountryWiseLatestService service;

    public CountryWiseLatestController(CountryWiseLatestService service) {
        this.service = service;
    }

    @GetMapping
    public List<CountryWiseLatest> getAll() {
        return service.getAll();
    }

    @GetMapping("/{country}")
    public CountryWiseLatest getByCountry(@PathVariable String country) {
        return service.getByCountry(country);
    }

    @GetMapping("/who/{region}")
    public List<CountryWiseLatest> getByWhoRegion(@PathVariable("region") String whoRegion) {
        return service.getByWhoRegion(whoRegion);
    }

    @GetMapping("/lessThanActive/{maxActive}")
    public List<CountryWiseLatest> getByActiveLessThan(@PathVariable Long maxActive) {
        return service.getByActiveLessThan(maxActive);
    }

    @GetMapping("/moreThanActive/{minActive}")      
    public List<CountryWiseLatest> getByActiveGreaterThan(@PathVariable Long minActive) {
        return service.getByActiveGreaterThan(minActive);
    }

    @PutMapping("/{country}")
    public CountryWiseLatest updateByCountry(@PathVariable String country, @RequestBody CountryWiseLatest updated) {
        return service.updateByCountry(country, updated);
    }

    @PutMapping("/{country}/updateRecovered")
    public CountryWiseLatest updateRecovered(@PathVariable String country) {
        return service.updateRecovered(country);
    }
}
