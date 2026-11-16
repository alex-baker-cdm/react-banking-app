package com.demo.banking.wells

import kotlinx.serialization.Serializable

@Serializable
data class MarketIndex(
    val id: String,
    val name: String,
    val value: Double,
    val change: Double = 0.0,
    val changePct: Double = 0.0,
)

@Serializable
data class Company(
    val id: String,
    val ticker: String,
    val name: String,
    val sector: String = "",
    val rating: String = "",
    val outlook: String = "",
    val price: Double = 0.0,
    val change: Double = 0.0,
    val changePct: Double = 0.0,
    val marketCapBn: Double = 0.0,
) {
    val pickerLabel: String get() = "$ticker - $name"
}

@Serializable
data class Watchlist(
    val id: String,
    val name: String,
    val companies: List<Company> = emptyList(),
) {
    val countLabel: String get() = Format.companyCount(companies.size)
}

@Serializable
data class RatingAction(
    val id: String,
    val companyId: String,
    val date: String,
    val action: String,
    val fromRating: String? = null,
    val toRating: String? = null,
    val outlook: String? = null,
    val summary: String = "",
) {
    /** "A- → A" when the rating moved, otherwise just the rating. */
    val ratingLabel: String
        get() {
            val to = toRating ?: fromRating ?: ""
            return if (fromRating != null && fromRating != to) "$fromRating → $to" else to
        }
}

enum class AlertType(val wire: String, val label: String) {
    RATING("rating", "Rating change"),
    PRICE("price", "Price"),
}

enum class AlertDirection(val wire: String, val label: String, val phrase: String) {
    ABOVE("above", "Rises above", "rises above"),
    BELOW("below", "Falls below", "falls below"),
}

@Serializable
data class Alert(
    val id: String,
    val companyId: String,
    val type: String,
    val direction: String? = null,
    val threshold: Double? = null,
    val note: String = "",
    val createdAt: String = "",
    val company: Company? = null,
) {
    /** One line, e.g. "Rating change alert for Apple Inc." or "Price alert for Tesla, Inc. when it falls below $400.50". */
    val description: String
        get() {
            val name = company?.name ?: companyId.uppercase()
            if (type != AlertType.PRICE.wire) return "Rating change alert for $name"
            val phrase = AlertDirection.entries.firstOrNull { it.wire == direction }?.phrase ?: "reaches"
            return "Price alert for $name when it $phrase ${Format.money(threshold ?: 0.0)}"
        }
}

@Serializable
data class AlertRequest(
    val companyId: String,
    val type: String,
    val direction: String? = null,
    val threshold: String? = null,
    val note: String = "",
)

@Serializable data class IndicesResponse(val indices: List<MarketIndex>)
@Serializable data class CompaniesResponse(val companies: List<Company>)
@Serializable data class WatchlistsResponse(val watchlists: List<Watchlist>)
@Serializable data class RatingActionsResponse(val ratingActions: List<RatingAction>)
@Serializable data class AlertsResponse(val alerts: List<Alert>)
@Serializable data class AlertResponse(val alert: Alert)
