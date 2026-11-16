import SwiftUI

struct AppHeader: View {
    var showsProduct = true
    var onSignOff: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center, spacing: 10) {
                Text("header.wordmark".localized)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(.black)
                    .accessibilityAddTraits(.isHeader)
                if showsProduct {
                    Text("header.product".localized)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.muted)
                }
                Spacer()
                if let onSignOff {
                    Button("header.sign_off".localized, action: onSignOff)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                        .padding(.horizontal, 12)
                        .frame(minHeight: 44)
                        .contentShape(Rectangle())
                }
            }
            .padding(.horizontal, 20)
            .frame(height: 56)
            .background(Color.white)
            Rectangle().fill(Theme.red).frame(height: 4)
        }
    }
}

enum BannerKind {
    case error, success

    var background: Color { self == .error ? Theme.errorBackground : Theme.successBackground }
    var accent: Color { self == .error ? Theme.negative : Theme.positive }
}

struct Banner<Content: View>: View {
    let kind: BannerKind
    let heading: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(heading).font(.headline).foregroundStyle(Theme.ink)
            content().font(.subheadline).foregroundStyle(Theme.text)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(kind.background)
        .overlay(alignment: .leading) { Rectangle().fill(kind.accent).frame(width: 6) }
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Theme.line))
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(configuration.isPressed ? Theme.redDark : Theme.red)
            .clipShape(RoundedRectangle(cornerRadius: 4))
    }
}

struct OutlineButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(Theme.red)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(configuration.isPressed ? Theme.errorBackground : Color.white)
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Theme.red, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 4))
    }
}

struct Card<Content: View>: View {
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) { content() }
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Theme.line))
    }
}

struct SectionHeader: View {
    let title: String
    var trailing: String? = nil

    var body: some View {
        HStack {
            Text(title).font(.headline).foregroundStyle(Theme.ink)
            Spacer()
            if let trailing {
                Text(trailing).font(.subheadline).foregroundStyle(Theme.muted)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(hex: 0xFAFAFA))
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
    }
}

struct Footer: View {
    var body: some View {
        Text("footer.disclaimer".localized)
            .font(.footnote)
            .foregroundStyle(Theme.muted)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .padding(20)
    }
}

struct ScreenTitle: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.title.weight(.semibold))
            .foregroundStyle(Theme.ink)
            .accessibilityAddTraits(.isHeader)
    }
}

struct RatingChip: View {
    let rating: String

    var body: some View {
        Text(rating)
            .font(.caption.weight(.bold))
            .foregroundStyle(Theme.ink)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Theme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 4))
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Theme.line))
            .accessibilityLabel("common.rating.accessibility".localizedFormat(rating))
    }
}

struct ChangeText: View {
    let pct: Double

    var body: some View {
        Text(Format.change(pct))
            .font(.footnote.weight(.semibold))
            .foregroundStyle(Format.changeColor(pct))
            .accessibilityLabel(Format.spokenChange(pct))
    }
}

struct ReferenceId: View {
    let error: ApiError

    var body: some View {
        if error.isServerError, let ref = error.correlationId {
            Text("common.reference_id".localizedFormat(ref)).font(.footnote).foregroundStyle(Theme.muted).textSelection(.enabled)
        }
    }
}
