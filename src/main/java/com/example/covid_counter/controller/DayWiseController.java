package com.example.covid_counter.controller;

import com.example.covid_counter.model.DayWise;
import com.example.covid_counter.service.DayWiseService;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * REST endpoints for day_wise table.
 * - GET /day-wise?date=2020-03 filters by date prefix
 */
@RestController
@RequestMapping("/day-wise")
public class DayWiseController {

    private final DayWiseService service;

    public DayWiseController(DayWiseService service) {
        this.service = service;
    }

    @GetMapping
    public List<DayWise> getAll(@RequestParam(required = false) String date) {
        return service.getAll(date);
    }

    @PutMapping("/{date}")
    public DayWise update(@PathVariable String date, @RequestBody DayWise payload) {
        return service.updateByDate(date, payload);
    }
}
