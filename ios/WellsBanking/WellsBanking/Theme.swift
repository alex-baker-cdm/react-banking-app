import SwiftUI

enum Theme {
    static let red = Color(hex: 0xD71E28)
    static let redDark = Color(hex: 0xB31B1B)
    static let yellow = Color(hex: 0xFFCD41)
    static let ink = Color(hex: 0x141414)
    static let text = Color(hex: 0x333333)
    static let muted = Color(hex: 0x5A5A5A)
    static let line = Color(hex: 0xD6D6D6)
    static let surface = Color(hex: 0xF4F4F4)
    static let link = Color(hex: 0x2A5DB0)
    static let green = Color(hex: 0x1F7A3F)
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
    static func money(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "en_US")
        formatter.currencyCode = "USD"
        return formatter.string(from: NSNumber(value: value)) ?? String(format: "$%.2f", value)
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
