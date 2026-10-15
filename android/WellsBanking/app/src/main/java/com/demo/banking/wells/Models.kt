package com.demo.banking.wells

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class AccountType {
    @SerialName("checking") CHECKING,
    @SerialName("savings") SAVINGS,
    @SerialName("credit") CREDIT,
    @SerialName("loan") LOAN;

    val label: String
        get() = when (this) {
            CHECKING -> "Checking"
            SAVINGS -> "Savings"
            CREDIT -> "Credit card"
            LOAN -> "Mortgage"
        }

    val isDeposit: Boolean get() = this == CHECKING || this == SAVINGS
}

@Serializable
data class Account(
    val id: String,
    val type: AccountType,
    val name: String,
    val lastFour: String,
    val currentBalance: Double,
    val availableBalance: Double? = null,
    val availableCredit: Double? = null,
    val creditLimit: Double? = null,
    val minimumPaymentDue: Double? = null,
    val nextPaymentAmount: Double? = null,
    val paymentDueDate: String? = null,
    val apy: Double? = null,
) {
    val headlineBalance: Double
        get() = if (type.isDeposit) availableBalance ?: currentBalance else currentBalance

    val headlineLabel: String
        get() = when (type) {
            AccountType.CHECKING, AccountType.SAVINGS -> "Available balance"
            AccountType.CREDIT -> "Current balance"
            AccountType.LOAN -> "Principal balance"
        }

    /** Amount offered by the "Pay minimum due" quick action, or null when the account has nothing due. */
    val paymentDue: Double?
        get() = when (type) {
            AccountType.CREDIT -> minimumPaymentDue
            AccountType.LOAN -> nextPaymentAmount
            else -> null
        }?.takeIf { it > 0 }
}

@Serializable
data class Transaction(
    val id: String,
    val accountId: String,
    val postedAt: String,
    val description: String,
    val amount: Double,
)

@Serializable
data class TransferRequest(
    val fromAccountId: String,
    val toAccountId: String,
    val amount: String,
    val memo: String,
)

@Serializable
data class TransferReceipt(
    val confirmationNumber: String,
    val postedAt: String,
    val amount: Double,
    val memo: String? = null,
    val from: Account,
    val to: Account,
)

@Serializable data class AccountsResponse(val accounts: List<Account>)
@Serializable data class AccountResponse(val account: Account)
@Serializable data class TransactionsResponse(val transactions: List<Transaction>)
@Serializable data class TransferResponse(val transfer: TransferReceipt)
