package com.example.covid_counter.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Maps to table "worldometer_data".
 * Note: column names include spaces/slashes, so we quote them explicitly.
 * This mirrors the columns you listed from the DB.
 */
@Entity
@Data
@Table(name = "worldometer_data")
public class WorldometerData {

    @Id
    @Column(name = "Country/Region")
    private String countryRegion;

    @Column(name = "Continent")
    private String continent;

    @Column(name = "Population")
    private Long population;

    @Column(name = "TotalCases")
    private Long totalCases;

    @Column(name = "NewCases")
    private Long newCases;

    @Column(name = "TotalDeaths")
    private Long totalDeaths;

    @Column(name = "NewDeaths")
    private Long newDeaths;

    @Column(name = "TotalRecovered")
    private Long totalRecovered;

    @Column(name = "NewRecovered")
    private Long newRecovered;

    @Column(name = "ActiveCases")
    private Long activeCases;

    @Column(name = "Serious,Critical")
    private Long seriousCritical;

    @Column(name = "Tot Cases/1M pop")
    private BigDecimal totCasesPer1Mpop;

    @Column(name = "Deaths/1M pop")
    private BigDecimal deathsPer1Mpop;

    @Column(name = "TotalTests")
    private Long totalTests;

    @Column(name = "Tests/1M pop")
    private BigDecimal testsPer1Mpop;

    @Column(name = "WHO Region")
    private String whoRegion;
}
