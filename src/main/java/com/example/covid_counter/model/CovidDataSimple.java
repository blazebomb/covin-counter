package com.example.covid_counter.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Maps to table covid_data_1000_records_simple_id.
 */
@Entity
@Data
@Table(name = "covid_data_1000_records_simple_id")
public class CovidDataSimple {

    @Id
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "Country")
    private String country;

    @Column(name = "Latitude")
    private Double latitude;

    @Column(name = "Longitude")
    private Double longitude;

    @Column(name = "Total Cases")
    private Long totalCases;

    @Column(name = "Total Deaths")
    private Long totalDeaths;

    @Column(name = "Total Recovered")
    private Long totalRecovered;

    @Column(name = "Active Cases")
    private Long activeCases;

    @Column(name = "Region")
    private String region;

    @Column(name = "Cases per Million")
    private Double casesPerMillion;

    @Column(name = "Deaths per Million")
    private Double deathsPerMillion;
}
