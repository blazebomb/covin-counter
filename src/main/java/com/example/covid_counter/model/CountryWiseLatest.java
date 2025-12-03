package com.example.covid_counter.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
@Table(name = "country_wise_latest")
public class CountryWiseLatest {

    @Id
    @Column(name = "`Country/Region`")
    private String countryRegion;

    @Column(name = "Confirmed")
    private Long confirmed;

    @Column(name = "Deaths")
    private Long deaths;

    @Column(name = "Recovered")
    private Long recovered;

    @Column(name = "Active")
    private Long active;

    @Column(name = "`New cases`")
    private Long newCases;

    @Column(name = "`New deaths`")
    private Long newDeaths;

    @Column(name = "`New recovered`")
    private Long newRecovered;

    @Column(name = "`Deaths / 100 Cases`")
    private BigDecimal deathsPer100Cases;

    @Column(name = "`Recovered / 100 Cases`")
    private BigDecimal recoveredPer100Cases;

    @Column(name = "`Deaths / 100 Recovered`")
    private BigDecimal deathsPer100Recovered;

    @Column(name = "`Confirmed last week`")
    private Long confirmedLastWeek;

    @Column(name = "`1 week change`")
    private Long oneWeekChange;

    @Column(name = "`1 week % increase`")
    private BigDecimal oneWeekPercentIncrease;

    @Column(name = "`WHO Region`")  
    private String whoRegion;
}


