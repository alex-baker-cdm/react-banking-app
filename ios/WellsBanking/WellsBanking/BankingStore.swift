import Foundation
import Observation

enum Page: Hashable {
    case watchlists, alerts
}

@Observable
final class BankingStore {
    var signedOn = false
    var page: Page = .watchlists
    var indices: [MarketIndex] = []
    var watchlists: [Watchlist] = []
    var companies: [Company] = []
    var alerts: [MarketAlert] = []
    var loading = true
    var loadError: ApiError?
    /// Company handed from the company profile to the Alerts form.
    var alertCompanyId: String?

    private let api = ApiClient.shared

    func refresh() async {
        do {
            async let indices = api.indices()
            async let watchlists = api.watchlists()
            async let companies = api.companies()
            async let alerts = api.alerts()
            (self.indices, self.watchlists, self.companies, self.alerts) = try await (indices, watchlists, companies, alerts)
            loadError = nil
        } catch let error as ApiError {
            loadError = error
        } catch {
            loadError = .network
        }
        loading = false
    }

    func signOff() {
        signedOn = false
        page = .watchlists
        alertCompanyId = nil
        loading = true
    }

    func ratingActions(for company: Company) async throws -> [RatingAction] {
        try await api.ratingActions(companyId: company.id)
    }

    func createAlert(_ request: AlertRequest) async throws -> MarketAlert {
        let alert = try await api.createAlert(request)
        alerts.insert(alert, at: 0)
        return alert
    }

    func removeAlert(_ alert: MarketAlert) async throws {
        try await api.deleteAlert(id: alert.id)
        alerts.removeAll { $0.id == alert.id }
    }

    func startAlert(for company: Company) {
        alertCompanyId = company.id
        page = .alerts
    }
}
