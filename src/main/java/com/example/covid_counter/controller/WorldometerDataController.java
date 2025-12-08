package com.example.covid_counter.controller;

import com.example.covid_counter.model.WorldometerData;
import com.example.covid_counter.service.WorldometerDataService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for worldometer_data table.
 * - GET /worldometer?country=In&continent=As filters by prefixes
 * - PUT /worldometer/{country} updates the record by country name
 */
@RestController
@RequestMapping("/worldometer")
public class WorldometerDataController {

    private final WorldometerDataService service;

    public WorldometerDataController(WorldometerDataService service) {
        this.service = service;
    }

    /**
     * List worldometer rows with optional prefix filters.
     * Both filters are optional; pass either or both.
     */
    @GetMapping
    public List<WorldometerData> getAll(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String continent) {
        return service.getAll(country, continent);
    }

    /**
     * Update a single country row.
     */
    @PutMapping("/{country}")
    public WorldometerData updateByCountry(
            @PathVariable String country,
            @RequestBody WorldometerData updated) {
        return service.updateByCountry(country, updated);
    }
}
