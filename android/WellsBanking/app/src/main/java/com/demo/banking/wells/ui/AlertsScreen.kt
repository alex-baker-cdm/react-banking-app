package com.demo.banking.wells.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.demo.banking.wells.Alert
import com.demo.banking.wells.AlertDirection
import com.demo.banking.wells.AlertType
import com.demo.banking.wells.BankingStore
import com.demo.banking.wells.Format
import com.demo.banking.wells.WfColors

@Composable
fun AlertsScreen(store: BankingStore) {
    val form = store.alertForm

    Column(
        Modifier.fillMaxSize().background(WfColors.surface).verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        ScreenTitle("Alerts")

        form.created?.let { alert ->
            Column(Modifier.semantics { liveRegion = LiveRegionMode.Polite }) {
                Banner(BannerKind.SUCCESS, "Alert created") {
                    Text(alert.description, fontSize = 15.sp, color = WfColors.text)
                }
            }
        }
        form.failure?.let { failure ->
            Column(Modifier.semantics { liveRegion = LiveRegionMode.Assertive }) {
                ErrorBanner("We couldn't create your alert", failure)
            }
        }

        Card {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                LabeledField("Company", error = form.errorFor("companyId")) {
                    OptionPicker(
                        label = "Company",
                        options = store.companies.map { it.id to it.pickerLabel },
                        selectedId = form.companyId,
                        placeholder = "Select a company",
                        onSelect = { form.companyId = it },
                    )
                }
                LabeledField("Alert type", error = form.errorFor("type")) {
                    OptionPicker(
                        label = "Alert type",
                        options = AlertType.entries.map { it.name to it.label },
                        selectedId = form.type.name,
                        placeholder = "Select an alert type",
                        onSelect = { form.type = AlertType.valueOf(it) },
                    )
                }
                if (form.type == AlertType.PRICE) {
                    LabeledField("Direction", error = form.errorFor("direction")) {
                        OptionPicker(
                            label = "Direction",
                            options = AlertDirection.entries.map { it.name to it.label },
                            selectedId = form.direction?.name ?: "",
                            placeholder = "Select a direction",
                            onSelect = { form.direction = AlertDirection.valueOf(it) },
                        )
                    }
                    LabeledField("Price", error = form.errorFor("threshold")) {
                        OutlinedTextField(
                            value = form.price,
                            onValueChange = { form.price = it },
                            singleLine = true,
                            prefix = { Text("$", color = WfColors.muted) },
                            placeholder = { Text("0.00", color = WfColors.muted) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            colors = fieldColors(),
                            modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Price" },
                        )
                    }
                }
                LabeledField("Note (optional)") {
                    OutlinedTextField(
                        value = form.note,
                        onValueChange = { form.note = it },
                        singleLine = true,
                        colors = fieldColors(),
                        modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Note (optional)" },
                    )
                }
                PrimaryButton(
                    text = if (form.submitting) "Creating…" else "Create alert",
                    enabled = !form.submitting,
                    onClick = { store.submitAlert() },
                )
            }
        }

        store.alertsError?.let { ErrorBanner("We couldn't update your alerts", it) }

        Card {
            SectionHeader("Your alerts")
            if (store.alertsLoaded && store.alerts.isEmpty()) {
                Text("You have no alerts.", fontSize = 15.sp, color = WfColors.muted, modifier = Modifier.padding(16.dp))
            }
            store.alerts.forEach { alert -> AlertRow(alert, onRemove = { store.removeAlert(alert) }) }
        }
        Footer()
    }
}

@Composable
private fun AlertRow(alert: Alert, onRemove: () -> Unit) {
    Column {
        Row(Modifier.fillMaxWidth().padding(start = 16.dp, top = 8.dp, bottom = 8.dp, end = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(alert.description, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
                if (alert.note.isNotBlank()) Text(alert.note, fontSize = 14.sp, color = WfColors.text)
                Text("Created ${Format.date(alert.createdAt)}", fontSize = 13.sp, color = WfColors.muted)
            }
            TextButton(
                onClick = onRemove,
                modifier = Modifier.semantics { contentDescription = "Remove ${alert.description}" },
            ) {
                Text("Remove", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = WfColors.link)
            }
        }
        HorizontalDivider(color = WfColors.line)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun OptionPicker(
    label: String,
    options: List<Pair<String, String>>,
    selectedId: String,
    placeholder: String,
    onSelect: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    val selected = options.firstOrNull { it.first == selectedId }

    ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
        OutlinedTextField(
            value = selected?.second ?: placeholder,
            onValueChange = {},
            readOnly = true,
            singleLine = true,
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            colors = fieldColors(),
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                .semantics { contentDescription = label },
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach { (id, text) ->
                DropdownMenuItem(
                    text = { Text(text) },
                    onClick = {
                        onSelect(id)
                        expanded = false
                    },
                    contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding,
                )
            }
        }
    }
}
