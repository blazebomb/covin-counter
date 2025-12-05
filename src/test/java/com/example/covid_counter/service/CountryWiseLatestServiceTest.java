package com.example.covid_counter.service;

import com.example.covid_counter.model.CountryWiseLatest;
import com.example.covid_counter.repo.CountryWiseLatestRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // enables Mockito annotations in JUnit 5
class CountryWiseLatestServiceTest {

    @Mock
    CountryWiseLatestRepo repo; // fake repo so we don't hit the DB

    @InjectMocks
    CountryWiseLatestService service; // class under test, gets mock injected

    @Test
    void updateRecoveredComputesRecoveredFromConfirmedMinusDeathsMinusActive() {
        // Given an existing row with these numbers
        CountryWiseLatest existing = new CountryWiseLatest();
        existing.setCountryRegion("USA");
        existing.setConfirmed(100L);
        existing.setDeaths(10L);
        existing.setActive(20L);

        // Repo should return that row when asked for "USA"
        when(repo.findById("USA")).thenReturn(Optional.of(existing));
        // Make save return whatever we pass in (common Mockito pattern)
        when(repo.save(any(CountryWiseLatest.class))).thenAnswer(inv -> inv.getArgument(0));

        // When we call the method
        CountryWiseLatest result = service.updateRecovered("USA");

        // Then recovered should be confirmed - deaths - active = 70
        assertEquals(70L, result.getRecovered());

        // And it should have been saved with that value
        ArgumentCaptor<CountryWiseLatest> captor = ArgumentCaptor.forClass(CountryWiseLatest.class);
        verify(repo).save(captor.capture());
        assertEquals(70L, captor.getValue().getRecovered());
    }
}
