package com.demo.banking.wells.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.demo.banking.wells.Account
import com.demo.banking.wells.BankingStore
import com.demo.banking.wells.Format
import com.demo.banking.wells.WfColors

@Composable
fun TransferScreen(store: BankingStore) {
    val form = store.transfer
    val fromOptions = store.accounts.filter { it.type.isDeposit }
    val toOptions = store.accounts.filter { it.id != form.fromAccountId }

    LaunchedEffect(fromOptions.map { it.id }) {
        if (form.fromAccountId.isEmpty() || fromOptions.none { it.id == form.fromAccountId }) {
            form.fromAccountId = fromOptions.firstOrNull { it.id != form.toAccountId }?.id ?: ""
        }
    }

    Column(
        Modifier.fillMaxSize().background(WfColors.surface).verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Transfer & Pay", fontSize = 28.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
        Text("Move money between your accounts or make a payment.", fontSize = 15.sp, color = WfColors.muted)

        val receipt = form.receipt
        val failure = form.failure
        if (receipt != null) {
            Banner(BannerKind.SUCCESS, "Transfer complete") {
                Text(
                    "${Format.money(receipt.amount)} moved from ${receipt.from.name} ...${receipt.from.lastFour} " +
                        "to ${receipt.to.name} ...${receipt.to.lastFour} on ${Format.date(receipt.postedAt)}.",
                    fontSize = 15.sp,
                    color = WfColors.text,
                )
                Text("Confirmation number ${receipt.confirmationNumber}", fontSize = 13.sp, color = WfColors.muted)
            }
            OutlineButton("Make another transfer", onClick = { form.reset() })
        } else if (failure != null) {
            Banner(BannerKind.ERROR, "We couldn't complete your transfer") {
                Text(failure.message, fontSize = 15.sp, color = WfColors.text)
                failure.correlationId?.let { Text("Reference ID $it", fontSize = 13.sp, color = WfColors.muted) }
            }
            OutlineButton("Try again", onClick = { form.reset() })
        } else {
            Card {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                    form.prefillNote?.let { Text(it, fontSize = 13.sp, color = WfColors.muted) }
                    LabeledField("From", error = form.fieldError?.takeIf { it.field == "fromAccountId" }?.message) {
                        AccountPicker(
                            label = "From",
                            options = fromOptions,
                            selectedId = form.fromAccountId,
                            placeholder = "Select an account",
                            onSelect = {
                                form.fromAccountId = it
                                if (form.toAccountId == it) form.toAccountId = ""
                            },
                        )
                    }
                    LabeledField("To", error = form.fieldError?.takeIf { it.field == "toAccountId" }?.message) {
                        AccountPicker(
                            label = "To",
                            options = toOptions,
                            selectedId = form.toAccountId,
                            placeholder = "Select an account",
                            onSelect = { form.toAccountId = it },
                        )
                    }
                    LabeledField("Amount", error = form.fieldError?.takeIf { it.field == "amount" }?.message) {
                        OutlinedTextField(
                            value = form.amount,
                            onValueChange = { form.amount = it },
                            singleLine = true,
                            prefix = { Text("$", color = WfColors.muted) },
                            placeholder = { Text("0.00", color = WfColors.muted) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            colors = fieldColors(),
                            modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Amount" },
                        )
                    }
                    LabeledField("Memo (optional)") {
                        OutlinedTextField(
                            value = form.memo,
                            onValueChange = { form.memo = it },
                            singleLine = true,
                            placeholder = { Text("e.g. October payment", color = WfColors.muted) },
                            colors = fieldColors(),
                            modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Memo" },
                        )
                    }
                    PrimaryButton(
                        text = if (form.submitting) "Submitting…" else "Transfer",
                        enabled = !form.submitting,
                        onClick = { store.submitTransfer() },
                    )
                }
            }
        }
        Footer()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AccountPicker(
    label: String,
    options: List<Account>,
    selectedId: String,
    placeholder: String,
    onSelect: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    val selected = options.firstOrNull { it.id == selectedId }

    ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
        OutlinedTextField(
            value = selected?.let { "${it.name} ...${it.lastFour}" } ?: placeholder,
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
            options.forEach { account ->
                DropdownMenuItem(
                    text = { Text("${account.name} ...${account.lastFour}") },
                    onClick = {
                        onSelect(account.id)
                        expanded = false
                    },
                    contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding,
                )
            }
        }
    }
}
