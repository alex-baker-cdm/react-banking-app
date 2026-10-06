import SwiftUI

struct AppHeader: View {
    var subtitle: String = "Online Banking"
    var onSignOff: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("WELLS FARGO")
                    .font(.system(size: 20, weight: .bold, design: .serif))
                    .kerning(2)
                    .foregroundStyle(.white)
                Spacer()
                if let onSignOff {
                    Button("Sign off", action: onSignOff)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .overlay(Capsule().stroke(.white.opacity(0.7), lineWidth: 1))
                } else {
                    Text(subtitle).font(.system(size: 13)).foregroundStyle(.white)
                }
            }
            .padding(.horizontal, 20)
            .frame(height: 56)
            .background(Theme.red)
            Rectangle().fill(Theme.yellow).frame(height: 6)
        }
    }
}

enum BannerKind {
    case error, success

    var background: Color { self == .error ? Theme.errorBackground : Theme.successBackground }
    var accent: Color { self == .error ? Theme.red : Theme.green }
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
            .clipShape(Capsule())
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
            .overlay(Capsule().stroke(Theme.red, lineWidth: 1))
            .clipShape(Capsule())
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
                Text(trailing).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.ink)
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
        Text("Demo environment. Not affiliated with Wells Fargo & Company.")
            .font(.footnote)
            .foregroundStyle(Theme.muted)
            .frame(maxWidth: .infinity)
            .padding(20)
    }
}
