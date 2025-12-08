package com.example.covid_counter.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Maps to the day_wise table (one row per date).
 */
@Entity
@Data
@Table(name = "day_wise")
public class DayWise {

    @Id
    @Column(name = "Date")
    private String date;

    @Column(name = "Confirmed")
    private Long confirmed;

    @Column(name = "Deaths")
    private Long deaths;

    @Column(name = "Recovered")
    private Long recovered;

    @Column(name = "Active")
    private Long active;

    @Column(name = "New cases")
    private Long newCases;

    @Column(name = "New deaths")
    private Long newDeaths;

    @Column(name = "New recovered")
    private Long newRecovered;

    @Column(name = "Deaths / 100 Cases")
    private BigDecimal deathsPer100Cases;

    @Column(name = "Recovered / 100 Cases")
    private BigDecimal recoveredPer100Cases;

    @Column(name = "Deaths / 100 Recovered")
    private BigDecimal deathsPer100Recovered;

    @Column(name = "No. of countries")
    private Long numberOfCountries;
}
