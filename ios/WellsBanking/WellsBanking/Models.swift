import Foundation

struct MarketIndex: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let value: Double
    let change: Double
    let changePct: Double
}

struct Company: Codable, Identifiable, Hashable {
    let id: String
    let ticker: String
    let name: String
    let sector: String
    let rating: String
    let outlook: String
    let price: Double
    let change: Double
    let changePct: Double
    let marketCapBn: Double
}

struct Watchlist: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    var companies: [Company]

    var countLabel: String { "watchlists.company_count".localizedFormat(companies.count) }
}

struct RatingAction: Codable, Identifiable, Hashable {
    let id: String
    let companyId: String
    let date: String
    let action: String
    let fromRating: String?
    let toRating: String
    let outlook: String?
    let summary: String

    var spokenRatingChange: String {
        guard let fromRating, fromRating != toRating else { return toRating }
        return "company.rating_actions.change.accessibility".localizedFormat(fromRating, toRating)
    }

    var ratingChange: String {
        guard let fromRating, fromRating != toRating else { return toRating }
        return "company.rating_actions.change".localizedFormat(fromRating, toRating)
    }
}

enum AlertType: String, Codable, CaseIterable, Identifiable {
    case rating, price

    var id: String { rawValue }
    var label: String { (self == .rating ? "alerts.form.type.rating" : "alerts.form.type.price").localizedString }
}

enum AlertDirection: String, Codable, CaseIterable, Identifiable {
    case above, below

    var id: String { rawValue }
    var label: String { (self == .above ? "alerts.form.direction.above" : "alerts.form.direction.below").localizedString }
}

struct MarketAlert: Codable, Identifiable, Hashable {
    let id: String
    let companyId: String
    let type: AlertType
    let direction: AlertDirection?
    let threshold: Double?
    let note: String?
    let createdAt: String
    let company: Company?

    var summary: String {
        let name = company?.name ?? companyId.uppercased()
        if type == .price, let direction, let threshold {
            return (direction == .above ? "alerts.summary.price.above" : "alerts.summary.price.below").localizedFormat(name, Format.price(threshold))
        }
        return "alerts.summary.rating".localizedFormat(name)
    }
}

struct AlertRequest: Encodable {
    let companyId: String
    let type: String
    let direction: String?
    let threshold: String?
    let note: String
}

struct IndicesResponse: Decodable { let indices: [MarketIndex] }
struct CompaniesResponse: Decodable { let companies: [Company] }
struct WatchlistsResponse: Decodable { let watchlists: [Watchlist] }
struct RatingActionsResponse: Decodable { let ratingActions: [RatingAction] }
struct AlertsResponse: Decodable { let alerts: [MarketAlert] }
struct AlertResponse: Decodable { let alert: MarketAlert }
