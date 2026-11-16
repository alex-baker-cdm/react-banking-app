package com.demo.banking.wells.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.demo.banking.wells.ApiError
import com.demo.banking.wells.BankingStore
import com.demo.banking.wells.Company
import com.demo.banking.wells.Format
import com.demo.banking.wells.MarketIndex
import com.demo.banking.wells.RatingAction
import com.demo.banking.wells.Watchlist
import com.demo.banking.wells.WfColors
import com.demo.banking.wells.asApiError

@Composable
fun WatchlistsNavHost(store: BankingStore, nav: NavHostController) {
    NavHost(navController = nav, startDestination = "watchlists") {
        composable("watchlists") {
            WatchlistsScreen(store, onOpen = { nav.navigate("company/${it.id}") })
        }
        composable("company/{id}") { entry ->
            val id = entry.arguments?.getString("id")
            val company = store.company(id)
            if (company == null) {
                LaunchedEffect(id) { nav.popBackStack() }
            } else {
                CompanyProfileScreen(store, company, onBack = { nav.popBackStack() })
            }
        }
    }
}

@Composable
fun WatchlistsScreen(store: BankingStore, onOpen: (Company) -> Unit) {
    Column(
        Modifier.fillMaxSize().background(WfColors.surface).verticalScroll(rememberScrollState()).padding(vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Box(Modifier.padding(horizontal = 20.dp)) { ScreenTitle("Watchlists") }

        val loadError = store.loadError
        if (store.loading) {
            Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = WfColors.red)
            }
        } else if (loadError != null) {
            Column(Modifier.padding(horizontal = 20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                ErrorBanner("We couldn't load your watchlists", loadError)
                OutlineButton("Retry", onClick = {
                    store.loading = true
                    store.refresh()
                })
            }
        } else {
            Row(
                Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                store.indices.forEach { IndexTile(it) }
            }
            Column(Modifier.padding(horizontal = 20.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                store.watchlists.forEach { watchlist -> WatchlistSection(watchlist, onOpen) }
            }
            Footer()
        }
    }
}

@Composable
private fun IndexTile(index: MarketIndex) {
    Card(Modifier.width(200.dp)) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(index.name, fontSize = 13.sp, color = WfColors.muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(Format.number(index.value), fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
            ChangeText(index.changePct)
        }
    }
}

@Composable
private fun WatchlistSection(watchlist: Watchlist, onOpen: (Company) -> Unit) {
    Card {
        SectionHeader(watchlist.name, trailing = watchlist.countLabel)
        watchlist.companies.forEach { company -> CompanyRow(company, onClick = { onOpen(company) }) }
    }
}

@Composable
private fun CompanyRow(company: Company, onClick: () -> Unit) {
    Column(Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(company.ticker, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = WfColors.ink)
                    RatingChip(company.rating)
                }
                Text(company.name, fontSize = 14.sp, color = WfColors.text)
                Text(company.outlook, fontSize = 13.sp, color = WfColors.muted)
            }
            Spacer(Modifier.width(12.dp))
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(Format.money(company.price), fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
                ChangeText(company.changePct)
            }
        }
        HorizontalDivider(color = WfColors.line)
    }
}

@Composable
fun CompanyProfileScreen(store: BankingStore, company: Company, onBack: () -> Unit) {
    var actions by remember(company.id) { mutableStateOf<List<RatingAction>>(emptyList()) }
    var error by remember(company.id) { mutableStateOf<ApiError?>(null) }

    LaunchedEffect(company.id) {
        try {
            actions = store.ratingActions(company)
        } catch (e: Exception) {
            error = e.asApiError()
        }
    }

    Column(Modifier.fillMaxSize().background(WfColors.surface)) {
        Row(
            Modifier.fillMaxWidth().background(Color.White).padding(horizontal = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = WfColors.ink)
            }
            Text("Company profile", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
        }
        HorizontalDivider(color = WfColors.line)

        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                ScreenTitle(company.name)
                Text("${company.ticker} · ${company.sector}", fontSize = 15.sp, color = WfColors.muted)
            }

            Card {
                LabeledValue("Issuer credit rating") { RatingChip(company.rating) }
                LabeledValue("Outlook") { ValueText(company.outlook) }
                LabeledValue("Price") {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ValueText(Format.money(company.price))
                        ChangeText(company.changePct)
                    }
                }
                LabeledValue("Market cap") { ValueText(Format.marketCap(company.marketCapBn)) }
            }

            error?.let { ErrorBanner("We couldn't load rating actions", it) }

            Card {
                SectionHeader("Rating actions")
                if (actions.isEmpty() && error == null) {
                    Text("No rating actions.", fontSize = 15.sp, color = WfColors.muted, modifier = Modifier.padding(16.dp))
                }
                actions.forEach { action ->
                    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(Format.date(action.date), fontSize = 13.sp, color = WfColors.muted)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(action.action, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
                            Spacer(Modifier.weight(1f))
                            Text(action.ratingLabel, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
                        }
                        Text(action.summary, fontSize = 14.sp, color = WfColors.text)
                    }
                    HorizontalDivider(color = WfColors.line)
                }
            }

            PrimaryButton("Create alert", onClick = { store.createAlertFor(company) })
        }
    }
}

@Composable
private fun LabeledValue(label: String, value: @Composable () -> Unit) {
    Column {
        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(label, fontSize = 15.sp, color = WfColors.muted)
            Spacer(Modifier.weight(1f))
            value()
        }
        HorizontalDivider(color = WfColors.line)
    }
}

@Composable
private fun ValueText(text: String) {
    Text(text, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
}
