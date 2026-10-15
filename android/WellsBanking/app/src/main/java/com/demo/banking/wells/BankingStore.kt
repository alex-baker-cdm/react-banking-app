package com.demo.banking.wells

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

enum class Page { ACCOUNTS, TRANSFER }

/** Values carried from an account's "Pay minimum due" quick action into the Transfer & Pay form. */
data class PaymentPrefill(val account: Account, val amount: Double) {
    val note: String get() = "Prefilled from Pay minimum due on ${account.name} ...${account.lastFour}"
}

/** Transfer & Pay form state. Lives in the store so it survives tab switches. */
class TransferFormState {
    var fromAccountId by mutableStateOf("")
    var toAccountId by mutableStateOf("")
    var amount by mutableStateOf("")
    var memo by mutableStateOf("")
    var prefillNote by mutableStateOf<String?>(null)
    var submitting by mutableStateOf(false)
    var fieldError by mutableStateOf<ApiError?>(null)
    var receipt by mutableStateOf<TransferReceipt?>(null)
    var failure by mutableStateOf<ApiError?>(null)
    var pendingPrefill by mutableStateOf<PaymentPrefill?>(null)

    val showingBanner: Boolean get() = receipt != null || failure != null

    fun apply(prefill: PaymentPrefill) {
        toAccountId = prefill.account.id
        amount = Format.plainAmount(prefill.amount)
        memo = "Minimum payment"
        prefillNote = prefill.note
        fieldError = null
        if (fromAccountId == prefill.account.id) fromAccountId = ""
    }

    fun reset() {
        receipt = null
        failure = null
        fieldError = null
        amount = ""
        memo = ""
        toAccountId = ""
        prefillNote = null
        pendingPrefill?.let { apply(it) }
        pendingPrefill = null
    }
}

class BankingStore(private val api: ApiClient = ApiClient.shared) : ViewModel() {
    var signedOn by mutableStateOf(false)
    var page by mutableStateOf(Page.ACCOUNTS)
    val accounts = mutableStateListOf<Account>()
    var loading by mutableStateOf(true)
    var loadError by mutableStateOf<String?>(null)
    val transfer = TransferFormState()

    val apiBaseUrl: String get() = api.baseUrl

    fun refresh() {
        viewModelScope.launch { refreshNow() }
    }

    suspend fun refreshNow() {
        try {
            val fresh = api.accounts()
            accounts.clear()
            accounts.addAll(fresh)
            loadError = null
        } catch (e: ApiError) {
            loadError = e.message
        } catch (e: Exception) {
            loadError = e.message ?: "Something went wrong."
        }
        loading = false
    }

    suspend fun transactions(account: Account): List<Transaction> = api.transactions(account.id)

    suspend fun transfer(request: TransferRequest): TransferReceipt {
        val receipt = api.transfer(request)
        refreshNow()
        return receipt
    }

    fun signOff() {
        signedOn = false
        page = Page.ACCOUNTS
        transfer.reset()
        transfer.fromAccountId = ""
    }

    /** "Pay minimum due": jump to Transfer & Pay with the payment prefilled (deferred while a banner is up). */
    fun payMinimumDue(account: Account) {
        val amount = account.paymentDue ?: return
        val prefill = PaymentPrefill(account, amount)
        if (transfer.showingBanner) {
            transfer.pendingPrefill = prefill
        } else {
            transfer.apply(prefill)
        }
        page = Page.TRANSFER
    }
}
