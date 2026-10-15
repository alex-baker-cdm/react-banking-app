package com.demo.banking.wells.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.demo.banking.wells.Account
import com.demo.banking.wells.AccountType
import com.demo.banking.wells.ApiError
import com.demo.banking.wells.BankingStore
import com.demo.banking.wells.Format
import com.demo.banking.wells.Transaction
import com.demo.banking.wells.WfColors

@Composable
fun AccountsNavHost(store: BankingStore, nav: NavHostController) {
    NavHost(navController = nav, startDestination = "summary") {
        composable("summary") {
            AccountSummaryScreen(store, onOpen = { nav.navigate("account/${it.id}") })
        }
        composable("account/{id}") { entry ->
            val id = entry.arguments?.getString("id")
            val account = store.accounts.firstOrNull { it.id == id }
            if (account == null) {
                LaunchedEffect(id) { nav.popBackStack() }
            } else {
                AccountDetailScreen(store, account, onBack = { nav.popBackStack() })
            }
        }
    }
}

@Composable
fun AccountSummaryScreen(store: BankingStore, onOpen: (Account) -> Unit) {
    val deposits = store.accounts.filter { it.type.isDeposit }
    val credit = store.accounts.filter { !it.type.isDeposit }
    val cashTotal = deposits.sumOf { it.headlineBalance }

    Column(
        Modifier.fillMaxSize().background(WfColors.surface).verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Text("Account Summary", fontSize = 28.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)

        val loadError = store.loadError
        if (store.loading) {
            Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = WfColors.red)
            }
        } else if (loadError != null) {
            Banner(BannerKind.ERROR, "We couldn't load your accounts") {
                Text(loadError, fontSize = 15.sp, color = WfColors.text)
                Text("API: ${store.apiBaseUrl}", fontSize = 12.sp, fontFamily = FontFamily.Monospace, color = WfColors.text)
            }
            OutlineButton("Retry", onClick = {
                store.loading = true
                store.refresh()
            })
        } else {
            Card {
                SectionHeader("Cash accounts", trailing = "${Format.money(cashTotal)} available")
                deposits.forEach { AccountRow(it, onClick = { onOpen(it) }) }
            }
            Card {
                SectionHeader("Credit cards & loans")
                credit.forEach { AccountRow(it, onClick = { onOpen(it) }) }
            }
            Footer()
        }
    }
}

@Composable
fun AccountRow(account: Account, onClick: () -> Unit) {
    Column(Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    account.type.label.uppercase(),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 0.8.sp,
                    color = WfColors.muted,
                )
                Text(
                    buildAnnotatedString {
                        withStyle(SpanStyle(fontWeight = FontWeight.SemiBold, color = WfColors.link, fontSize = 16.sp)) {
                            append(account.name)
                        }
                        withStyle(SpanStyle(color = WfColors.muted, fontSize = 13.sp)) { append("  ...${account.lastFour}") }
                    },
                )
                val due = account.paymentDueDate
                if (account.type == AccountType.CREDIT && due != null) {
                    Text(
                        "Minimum payment ${Format.money(account.minimumPaymentDue ?: 0.0)} due ${Format.date(due)}",
                        fontSize = 13.sp,
                        color = WfColors.muted,
                    )
                }
                if (account.type == AccountType.LOAN && due != null) {
                    Text(
                        "Next payment ${Format.money(account.nextPaymentAmount ?: 0.0)} due ${Format.date(due)}",
                        fontSize = 13.sp,
                        color = WfColors.muted,
                    )
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(Format.money(account.headlineBalance), fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
                Text(account.headlineLabel, fontSize = 13.sp, color = WfColors.muted)
                if (account.type == AccountType.CREDIT && account.availableCredit != null) {
                    Text("${Format.money(account.availableCredit)} available credit", fontSize = 13.sp, color = WfColors.muted)
                }
            }
        }
        HorizontalDivider(color = WfColors.line)
    }
}

@Composable
fun AccountDetailScreen(store: BankingStore, account: Account, onBack: () -> Unit) {
    var transactions by remember(account.id) { mutableStateOf<List<Transaction>>(emptyList()) }
    var error by remember(account.id) { mutableStateOf<String?>(null) }

    LaunchedEffect(account.id) {
        try {
            transactions = store.transactions(account)
        } catch (e: ApiError) {
            error = e.message
        } catch (e: Exception) {
            error = e.message ?: "Something went wrong."
        }
    }

    Column(Modifier.fillMaxSize().background(WfColors.surface)) {
        Row(
            Modifier.fillMaxWidth().background(Color.White).padding(horizontal = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = WfColors.red)
            }
            Text("Account", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
        }
        HorizontalDivider(color = WfColors.line)

        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                buildAnnotatedString {
                    withStyle(SpanStyle(fontSize = 22.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)) { append(account.name) }
                    withStyle(SpanStyle(fontSize = 15.sp, color = WfColors.muted)) { append("  ...${account.lastFour}") }
                },
            )
            Text(
                buildAnnotatedString {
                    withStyle(SpanStyle(fontSize = 28.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)) {
                        append(Format.money(account.headlineBalance))
                    }
                    withStyle(SpanStyle(fontSize = 15.sp, color = WfColors.muted)) { append("  ${account.headlineLabel.lowercase()}") }
                },
            )

            val due = account.paymentDue
            if (due != null) {
                Card {
                    SectionHeader("Quick actions")
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        val dueDate = account.paymentDueDate?.let { " by ${Format.date(it)}" } ?: ""
                        Text(
                            "${if (account.type == AccountType.CREDIT) "Minimum" else "Next payment"} due ${Format.money(due)}$dueDate",
                            fontSize = 15.sp,
                            color = WfColors.text,
                        )
                        PrimaryButton("Pay minimum due", onClick = { store.payMinimumDue(account) })
                    }
                }
            }

            error?.let {
                Banner(BannerKind.ERROR, "We couldn't load activity") { Text(it, fontSize = 15.sp, color = WfColors.text) }
            }

            Card {
                SectionHeader("Activity")
                transactions.forEach { txn ->
                    Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.Top) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(txn.description, fontSize = 15.sp, color = WfColors.ink)
                            Text(Format.date(txn.postedAt), fontSize = 13.sp, color = WfColors.muted)
                        }
                        Text(
                            Format.money(txn.amount),
                            fontSize = 15.sp,
                            fontWeight = if (txn.amount < 0) FontWeight.Normal else FontWeight.SemiBold,
                            color = if (txn.amount < 0) WfColors.ink else WfColors.green,
                        )
                    }
                    HorizontalDivider(color = WfColors.line)
                }
            }
        }
    }
}
