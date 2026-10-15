package com.demo.banking.wells.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.rememberNavController
import com.demo.banking.wells.BankingStore
import com.demo.banking.wells.Page
import com.demo.banking.wells.WfColors

@Composable
fun RootScreen(store: BankingStore) {
    if (!store.signedOn) {
        SignOnScreen(onSignedOn = { store.signedOn = true })
        return
    }

    LaunchedEffect(Unit) { store.refreshNow() }
    val accountsNav = rememberNavController()

    Scaffold(
        containerColor = WfColors.surface,
        topBar = { AppHeader(onSignOff = { store.signOff() }) },
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                val colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = WfColors.red,
                    selectedTextColor = WfColors.red,
                    indicatorColor = WfColors.errorBackground,
                    unselectedIconColor = WfColors.muted,
                    unselectedTextColor = WfColors.muted,
                )
                NavigationBarItem(
                    selected = store.page == Page.ACCOUNTS,
                    onClick = { store.page = Page.ACCOUNTS },
                    icon = { Icon(Icons.Filled.AccountBalance, contentDescription = null) },
                    label = { Text("Accounts") },
                    colors = colors,
                )
                NavigationBarItem(
                    selected = store.page == Page.TRANSFER,
                    onClick = { store.page = Page.TRANSFER },
                    icon = { Icon(Icons.Filled.SwapHoriz, contentDescription = null) },
                    label = { Text("Transfer & Pay") },
                    colors = colors,
                )
            }
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when (store.page) {
                Page.ACCOUNTS -> AccountsNavHost(store, accountsNav)
                Page.TRANSFER -> TransferScreen(store)
            }
        }
    }
}

@Composable
fun SignOnScreen(onSignedOn: () -> Unit) {
    var username by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var error by rememberSaveable { mutableStateOf<String?>(null) }

    Column(Modifier.fillMaxSize().background(WfColors.surface)) {
        AppHeader()
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(top = 44.dp, bottom = 20.dp),
        ) {
            Column(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, WfColors.line, RoundedCornerShape(8.dp))
                    .background(Color.White),
            ) {
                Box(Modifier.fillMaxWidth().height(6.dp).background(WfColors.red))
                Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Sign On", fontSize = 32.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
                    Text(
                        "Demo environment - any username and password will sign you on.",
                        fontSize = 15.sp,
                        color = WfColors.muted,
                    )
                    LabeledField("Username") {
                        OutlinedTextField(
                            value = username,
                            onValueChange = { username = it },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.None, autoCorrectEnabled = false),
                            colors = fieldColors(),
                            modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Username" },
                        )
                    }
                    LabeledField("Password") {
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            singleLine = true,
                            visualTransformation = PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            colors = fieldColors(),
                            modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Password" },
                        )
                    }
                    error?.let { Text(it, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = WfColors.red) }
                    PrimaryButton(
                        text = "Sign On",
                        modifier = Modifier.padding(top = 8.dp),
                        onClick = {
                            if (username.isBlank() || password.isEmpty()) {
                                error = "Enter your username and password."
                            } else {
                                error = null
                                onSignedOn()
                            }
                        },
                    )
                }
            }
        }
    }
}

@Composable
fun LabeledField(label: String, error: String? = null, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
        content()
        if (error != null) {
            Text(error, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = WfColors.red)
        }
    }
}

@Composable
fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = WfColors.link,
    unfocusedBorderColor = WfColors.fieldBorder,
    focusedContainerColor = Color.White,
    unfocusedContainerColor = Color.White,
    cursorColor = WfColors.ink,
    focusedTextColor = WfColors.ink,
    unfocusedTextColor = WfColors.ink,
)
