package com.demo.banking.wells

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

enum class Page { WATCHLISTS, ALERTS }

/** Alerts form state. Lives in the store so it survives tab switches. */
class AlertFormState {
    var companyId by mutableStateOf("")
    var type by mutableStateOf(AlertType.RATING)
    var direction by mutableStateOf<AlertDirection?>(null)
    var price by mutableStateOf("")
    var note by mutableStateOf("")
    var submitting by mutableStateOf(false)
    var fieldError by mutableStateOf<ApiError?>(null)
    var created by mutableStateOf<Alert?>(null)
    var failure by mutableStateOf<ApiError?>(null)

    fun errorFor(field: String): String? = fieldError?.takeIf { it.field == field }?.message

    fun clearMessages() {
        fieldError = null
        created = null
        failure = null
    }

    fun reset() {
        clearMessages()
        companyId = ""
        type = AlertType.RATING
        direction = null
        price = ""
        note = ""
    }
}

class BankingStore(private val api: ApiClient = ApiClient.shared) : ViewModel() {
    var signedOn by mutableStateOf(false)
    var page by mutableStateOf(Page.WATCHLISTS)

    val indices = mutableStateListOf<MarketIndex>()
    val watchlists = mutableStateListOf<Watchlist>()
    val companies = mutableStateListOf<Company>()
    var loading by mutableStateOf(true)
    var loadError by mutableStateOf<ApiError?>(null)

    val alerts = mutableStateListOf<Alert>()
    var alertsLoaded by mutableStateOf(false)
    var alertsError by mutableStateOf<ApiError?>(null)
    val alertForm = AlertFormState()

    fun refresh() {
        viewModelScope.launch { refreshNow() }
    }

    suspend fun refreshNow() {
        try {
            val freshIndices = api.indices()
            val freshWatchlists = api.watchlists()
            val freshCompanies = api.companies()
            indices.clear(); indices.addAll(freshIndices)
            watchlists.clear(); watchlists.addAll(freshWatchlists)
            companies.clear(); companies.addAll(freshCompanies)
            loadError = null
        } catch (e: Exception) {
            loadError = e.asApiError()
        }
        loading = false
    }

    fun company(id: String?): Company? =
        companies.firstOrNull { it.id == id }
            ?: watchlists.firstNotNullOfOrNull { list -> list.companies.firstOrNull { it.id == id } }

    suspend fun ratingActions(company: Company): List<RatingAction> = api.ratingActions(company.id)

    fun refreshAlerts() {
        viewModelScope.launch {
            try {
                val fresh = api.alerts()
                alerts.clear(); alerts.addAll(fresh)
                alertsError = null
            } catch (e: Exception) {
                alertsError = e.asApiError()
            }
            alertsLoaded = true
        }
    }

    /** Company profile "Create alert": open the Alerts tab with the company preselected. */
    fun createAlertFor(company: Company) {
        alertForm.clearMessages()
        alertForm.companyId = company.id
        page = Page.ALERTS
    }

    /** Runs in viewModelScope so leaving the Alerts tab mid-flight cannot cancel a posted alert. */
    fun submitAlert() {
        val form = alertForm
        if (form.submitting) return
        form.submitting = true
        form.clearMessages()
        val isPrice = form.type == AlertType.PRICE
        val request = AlertRequest(
            companyId = form.companyId,
            type = form.type.wire,
            direction = if (isPrice) form.direction?.wire else null,
            threshold = if (isPrice) form.price.trim() else null,
            note = form.note,
        )
        viewModelScope.launch {
            try {
                val alert = api.createAlert(request)
                if (!signedOn) return@launch
                alerts.add(0, alert)
                form.created = alert
                form.price = ""
                form.note = ""
            } catch (e: Exception) {
                if (!signedOn) return@launch
                val error = e.asApiError()
                if (!error.isServerError && error.field != null) form.fieldError = error else form.failure = error
            } finally {
                form.submitting = false
            }
        }
    }

    fun removeAlert(alert: Alert) {
        viewModelScope.launch {
            try {
                api.deleteAlert(alert.id)
                alerts.removeAll { it.id == alert.id }
                if (alertForm.created?.id == alert.id) alertForm.created = null
                alertsError = null
            } catch (e: Exception) {
                alertsError = e.asApiError()
            }
        }
    }

    fun signOff() {
        signedOn = false
        page = Page.WATCHLISTS
        loading = true
        alertsLoaded = false
        alerts.clear()
        alertForm.reset()
    }
}

fun Exception.asApiError(): ApiError =
    this as? ApiError ?: ApiError(0, "UNKNOWN", "Something went wrong. Please try again.", null, null)
