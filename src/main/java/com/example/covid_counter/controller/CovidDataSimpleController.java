package com.example.covid_counter.controller;

import com.example.covid_counter.model.CovidDataSimple;
import com.example.covid_counter.service.CovidDataSimpleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST endpoints for covid_data_1000_records_simple_id.
 * Filters by region or continent (both map to the Region column).
 */
@RestController
@RequestMapping("/covid-data")
public class CovidDataSimpleController {

    private final CovidDataSimpleService service;

    public CovidDataSimpleController(CovidDataSimpleService service) {
        this.service = service;
    }

    @GetMapping
    public List<CovidDataSimple> getAll(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String continent) {
        return service.getAll(country, region, continent);
    }

    @PutMapping("/{id}")
    public CovidDataSimple update(@PathVariable Long id, @RequestBody CovidDataSimple payload) {
        return service.update(id, payload);
    }
}
