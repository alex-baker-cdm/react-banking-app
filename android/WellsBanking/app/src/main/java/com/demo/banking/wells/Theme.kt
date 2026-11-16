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
    val red = Color(0xFFD71E28)
    val redDark = Color(0xFFB31B1B)
    val yellow = Color(0xFFFFCD41)
    val ink = Color(0xFF141414)
    val text = Color(0xFF333333)
    val muted = Color(0xFF5A5A5A)
    val line = Color(0xFFD6D6D6)
    val surface = Color(0xFFF4F4F4)
    val link = Color(0xFF2A5DB0)
    val green = Color(0xFF1F7A3F)
    val errorBackground = Color(0xFFFDECEC)
    val successBackground = Color(0xFFEAF6EE)
    val sectionHeader = Color(0xFFFAFAFA)
    val fieldBorder = Color(0xFF8A8A8A)
}

private val wellsColorScheme = lightColorScheme(
    primary = WfColors.red,
    onPrimary = Color.White,
    secondary = WfColors.link,
    background = WfColors.surface,
    onBackground = WfColors.ink,
    surface = Color.White,
    onSurface = WfColors.ink,
    surfaceVariant = WfColors.surface,
    onSurfaceVariant = WfColors.muted,
    outline = WfColors.fieldBorder,
    error = WfColors.red,
)

@Composable
fun WellsBankingTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = wellsColorScheme, content = content)
}

object Format {
    private val currency: NumberFormat = NumberFormat.getCurrencyInstance(Locale.US)
    private val isoDate: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.US)
    private val displayDate: DateTimeFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.US)

    fun money(value: Double): String = currency.format(value)

    /** Amount as typed into a form field: no symbol, no grouping, two decimals. */
    fun plainAmount(value: Double): String = String.format(Locale.US, "%.2f", value)

    fun date(iso: String): String = try {
        LocalDate.parse(iso.take(10), isoDate).format(displayDate)
    } catch (e: Exception) {
        iso
    }
}
