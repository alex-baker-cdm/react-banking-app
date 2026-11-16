import SwiftUI

enum Theme {
    static let red = Color(hex: 0xD6002A)
    static let redDark = Color(hex: 0xA80021)
    static let ink = Color(hex: 0x121212)
    static let text = Color(hex: 0x333333)
    static let muted = Color(hex: 0x5F6368)
    static let line = Color(hex: 0xD9D9D9)
    static let surface = Color(hex: 0xF5F5F5)
    static let link = Color(hex: 0x0B5CAB)
    static let positive = Color(hex: 0x1A7F37)
    static let negative = Color(hex: 0xB3261E)
    static let errorBackground = Color(hex: 0xFDECEC)
    static let successBackground = Color(hex: 0xEAF6EE)
}

extension Color {
    init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }
}

enum Format {
    private static func decimal(_ value: Double, fractionDigits: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: "en_US")
        formatter.minimumFractionDigits = fractionDigits
        formatter.maximumFractionDigits = fractionDigits
        return formatter.string(from: NSNumber(value: value)) ?? String(format: "%.\(fractionDigits)f", value)
    }

    static func number(_ value: Double) -> String { decimal(value, fractionDigits: 2) }

    static func price(_ value: Double) -> String { "$" + decimal(value, fractionDigits: 2) }

    static func marketCap(_ billions: Double) -> String { "company.market_cap.value".localizedFormat(decimal(billions, fractionDigits: 0)) }

    static func change(_ pct: Double) -> String {
        (pct < 0 ? "common.change.down" : "common.change.up").localizedFormat(decimal(abs(pct), fractionDigits: 2))
    }

    static func changeColor(_ pct: Double) -> Color { pct < 0 ? Theme.negative : Theme.positive }

    static func spokenChange(_ pct: Double) -> String {
        (pct < 0 ? "common.change.down.accessibility" : "common.change.up.accessibility").localizedFormat(decimal(abs(pct), fractionDigits: 2))
    }

    static func date(_ iso: String) -> String {
        let parser = DateFormatter()
        parser.locale = Locale(identifier: "en_US_POSIX")
        parser.dateFormat = "yyyy-MM-dd"
        guard let date = parser.date(from: iso) else { return iso }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US")
        formatter.dateFormat = "MMM d, yyyy"
        return formatter.string(from: date)
    }
}
