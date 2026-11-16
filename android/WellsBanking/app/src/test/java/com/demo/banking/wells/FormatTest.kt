package com.demo.banking.wells

import org.junit.Assert.assertEquals
import org.junit.Test

class FormatTest {
    @Test
    fun formatsPricesChangesAndMarketCap() {
        assertEquals("$512.30", Format.money(512.3))
        assertEquals("6,812.44", Format.number(6812.44))
        assertEquals("▲ +0.42%", Format.change(0.42))
        assertEquals("▼ -0.18%", Format.change(-0.18))
        assertEquals("$3,808B", Format.marketCap(3808.0))
        assertEquals("Oct 9, 2026", Format.date("2026-10-09"))
    }

    @Test
    fun ratingActionShowsTheMoveOnlyWhenTheRatingChanged() {
        val upgrade = RatingAction("ra-1", "jpm", "2025-11-20", "Upgrade", "A-", "A")
        val affirmed = RatingAction("ra-2", "msft", "2026-08-14", "Affirmed", "AAA", "AAA")
        assertEquals("A- → A", upgrade.ratingLabel)
        assertEquals("AAA", affirmed.ratingLabel)
    }

    @Test
    fun alertDescriptionIsOneLine() {
        val apple = Company(id = "aapl", ticker = "AAPL", name = "Apple Inc.")
        val tesla = Company(id = "tsla", ticker = "TSLA", name = "Tesla, Inc.")
        assertEquals("Rating change alert for Apple Inc.", Alert("al-1", "aapl", "rating", company = apple).description)
        assertEquals(
            "Price alert for Tesla, Inc. when it falls below $400.50",
            Alert("al-2", "tsla", "price", "below", 400.5, company = tesla).description,
        )
    }
}
