package com.demo.banking.wells

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class WatchlistTest {
    private fun company(id: String, name: String) = Company(id = id, ticker = id.uppercase(), name = name, rating = "A")

    private val apple = company("aapl", "Apple Inc.")
    private val tesla = company("tsla", "Tesla, Inc.")
    private val ford = company("f", "Ford Motor Company")
    private val all = listOf(apple, tesla, ford)
    private val core = Watchlist("wl-core", "Core coverage", listOf(apple))

    @Test
    fun candidatesExcludeCompaniesAlreadyInTheWatchlist() {
        assertEquals(listOf(tesla, ford), core.candidates(all))
    }

    @Test
    fun candidatesMatchNameOrTickerIgnoringCase() {
        assertEquals(listOf(tesla), core.candidates(all, "tsl"))
        assertEquals(listOf(ford), core.candidates(all, " MOTOR "))
        assertEquals(listOf(ford), core.candidates(all, "f").filter { it.ticker == "F" })
        assertTrue(core.candidates(all, "apple").isEmpty())
    }

    @Test
    fun candidatesAreEmptyWhenEveryCompanyIsInTheWatchlist() {
        assertTrue(Watchlist("wl-all", "Everything", all).candidates(all).isEmpty())
    }

    @Test
    fun statusMessagesAndRemoveLabelNameCompanyAndWatchlist() {
        assertEquals("Tesla, Inc. added to Core coverage.", core.addedMessage(tesla))
        assertEquals("Apple Inc. removed from Core coverage.", core.removedMessage(apple))
        assertEquals("Remove Apple Inc. from Core coverage", core.removeLabel(apple))
    }

    @Test
    fun countLabelFollowsTheNumberOfCompanies() {
        assertEquals("1 company", core.countLabel)
        assertEquals("0 companies", Watchlist("wl-empty", "Empty").countLabel)
        assertEquals("3 companies", Watchlist("wl-all", "Everything", all).countLabel)
    }
}
