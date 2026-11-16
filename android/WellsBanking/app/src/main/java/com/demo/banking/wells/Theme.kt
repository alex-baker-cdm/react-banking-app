package com.demo.banking.wells

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

object WfColors {
    val red = Color(0xFFD6002A)
    val redDark = Color(0xFFA80021)
    val ink = Color(0xFF121212)
    val text = Color(0xFF333333)
    val muted = Color(0xFF5F6368)
    val line = Color(0xFFD9D9D9)
    val surface = Color(0xFFF5F5F5)
    val link = Color(0xFF0B5CAB)
    val positive = Color(0xFF1A7F37)
    val negative = Color(0xFFB3261E)
    val fieldBorder = Color(0xFF8A8A8A)
    val sectionHeader = Color(0xFFF5F5F5)
    val errorBackground = Color(0xFFFDECEE)
    val successBackground = Color(0xFFEAF5EC)
}

private val wellsColorScheme = lightColorScheme(
    primary = WfColors.red,
    onPrimary = Color.White,
    secondary = WfColors.ink,
    onSecondary = Color.White,
    background = WfColors.surface,
    onBackground = WfColors.ink,
    surface = Color.White,
    onSurface = WfColors.ink,
    surfaceVariant = WfColors.surface,
    onSurfaceVariant = WfColors.muted,
    outline = WfColors.fieldBorder,
    error = WfColors.negative,
)

@Composable
fun WellsBankingTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = wellsColorScheme, content = content)
}

object Format {
    private val isoDate: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.US)
    private val displayDate: DateTimeFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.US)

    /** "$512.30" */
    fun money(value: Double): String = NumberFormat.getCurrencyInstance(Locale.US).format(value)

    /** Index level with two decimals: "6,812.44" */
    fun number(value: Double): String = String.format(Locale.US, "%,.2f", value)

    /** "▲ +0.42%" / "▼ -0.18%" */
    fun change(pct: Double): String =
        if (pct < 0) String.format(Locale.US, "▼ %.2f%%", pct) else String.format(Locale.US, "▲ +%.2f%%", pct)

    /** "$3,808B" */
    fun marketCap(billions: Double): String = String.format(Locale.US, "$%,.0fB", billions)

    fun companyCount(count: Int): String = if (count == 1) "1 company" else "$count companies"

    /** "Oct 9, 2026" */
    fun date(iso: String): String = try {
        LocalDate.parse(iso.take(10), isoDate).format(displayDate)
    } catch (e: Exception) {
        iso
    }
}
