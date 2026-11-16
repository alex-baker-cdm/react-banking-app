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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.demo.banking.wells.WfColors

@Composable
fun AppHeader(subtitle: String = "Online Banking", onSignOff: (() -> Unit)? = null) {
    Column(modifier = Modifier.fillMaxWidth().background(WfColors.red).statusBarsPadding()) {
        Row(
            modifier = Modifier.fillMaxWidth().height(56.dp).padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "WELLS FARGO",
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif,
                letterSpacing = 2.sp,
            )
            Spacer(Modifier.weight(1f))
            if (onSignOff != null) {
                TextButton(
                    onClick = onSignOff,
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.7f)),
                    colors = ButtonDefaults.textButtonColors(contentColor = Color.White),
                ) {
                    Text("Sign off", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }
            } else {
                Text(subtitle, color = Color.White, fontSize = 13.sp)
            }
        }
        Box(Modifier.fillMaxWidth().height(6.dp).background(WfColors.yellow))
    }
}

enum class BannerKind(val background: Color, val accent: Color) {
    ERROR(WfColors.errorBackground, WfColors.red),
    SUCCESS(WfColors.successBackground, WfColors.green),
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
        "Demo environment. Not affiliated with Wells Fargo & Company.",
        fontSize = 13.sp,
        color = WfColors.muted,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth().padding(20.dp),
    )
}
