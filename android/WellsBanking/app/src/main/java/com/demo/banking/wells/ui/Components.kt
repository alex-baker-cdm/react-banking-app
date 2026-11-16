package com.demo.banking.wells.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.TextUnit
import com.demo.banking.wells.ApiError
import com.demo.banking.wells.Format
import com.demo.banking.wells.WfColors

@Composable
fun AppHeader(onSignOff: (() -> Unit)? = null) {
    Column(modifier = Modifier.fillMaxWidth().background(Color.White).statusBarsPadding()) {
        Row(
            modifier = Modifier.fillMaxWidth().height(56.dp).padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("S&P Global", color = Color.Black, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            if (onSignOff != null) {
                TextButton(
                    onClick = onSignOff,
                    border = BorderStroke(1.dp, WfColors.fieldBorder),
                    colors = ButtonDefaults.textButtonColors(contentColor = WfColors.ink),
                ) {
                    Text("Sign off", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
        Box(Modifier.fillMaxWidth().height(4.dp).background(WfColors.red))
    }
}

enum class BannerKind(val background: Color, val accent: Color) {
    ERROR(WfColors.errorBackground, WfColors.negative),
    SUCCESS(WfColors.successBackground, WfColors.positive),
}

@Composable
fun Banner(kind: BannerKind, heading: String, content: @Composable ColumnScope.() -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(IntrinsicSize.Min)
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, WfColors.line, RoundedCornerShape(8.dp))
            .background(kind.background),
    ) {
        Box(Modifier.width(6.dp).fillMaxHeight().background(kind.accent))
        Column(Modifier.weight(1f).padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(heading, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
            content()
        }
    }
}

@Composable
fun PrimaryButton(text: String, onClick: () -> Unit, enabled: Boolean = true, modifier: Modifier = Modifier) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth().height(48.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = WfColors.red,
            contentColor = Color.White,
            disabledContainerColor = WfColors.red.copy(alpha = 0.6f),
            disabledContentColor = Color.White,
        ),
    ) {
        Text(text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun OutlineButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.fillMaxWidth().height(48.dp),
        border = BorderStroke(1.dp, WfColors.red),
        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White, contentColor = WfColors.red),
    ) {
        Text(text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun Card(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, WfColors.line, RoundedCornerShape(8.dp))
            .background(Color.White),
        content = content,
    )
}

@Composable
fun SectionHeader(title: String, trailing: String? = null) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth().background(WfColors.sectionHeader).padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(title, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
            Spacer(Modifier.weight(1f))
            if (trailing != null) {
                Text(trailing, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = WfColors.ink)
            }
        }
        HorizontalDivider(color = WfColors.line)
    }
}

@Composable
fun Footer() {
    Text(
        "Demo environment with illustrative data. Not affiliated with S&P Global Inc.",
        fontSize = 13.sp,
        color = WfColors.muted,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth().padding(20.dp),
    )
}

@Composable
fun ScreenTitle(text: String) {
    Text(
        text,
        fontSize = 28.sp,
        fontWeight = FontWeight.SemiBold,
        color = WfColors.ink,
        modifier = Modifier.semantics { heading() },
    )
}

/** Server failure panel: the message plus "Reference ID: <correlationId>" when the API supplied one. */
@Composable
fun ErrorBanner(heading: String, error: ApiError) {
    Banner(BannerKind.ERROR, heading) {
        Text(error.message, fontSize = 15.sp, color = WfColors.text)
        if (error.isServerError && error.correlationId != null) {
            Text("Reference ID: ${error.correlationId}", fontSize = 13.sp, color = WfColors.muted)
        }
    }
}

@Composable
fun RatingChip(rating: String) {
    Text(
        rating,
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = WfColors.ink,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .border(1.dp, WfColors.line, RoundedCornerShape(4.dp))
            .background(WfColors.surface)
            .padding(horizontal = 6.dp, vertical = 2.dp),
    )
}

@Composable
fun ChangeText(pct: Double, fontSize: TextUnit = 13.sp) {
    Text(
        Format.change(pct),
        fontSize = fontSize,
        fontWeight = FontWeight.Medium,
        color = if (pct < 0) WfColors.negative else WfColors.positive,
    )
}
