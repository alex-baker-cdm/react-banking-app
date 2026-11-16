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
    var watchlistStatus: String?
    var watchlistError: ApiError?

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
        watchlistStatus = nil
        watchlistError = nil
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

    func companiesAvailable(for watchlist: Watchlist) -> [Company] {
        let present = Set(watchlist.companies.map(\.id))
        return companies.filter { !present.contains($0.id) }
    }

    func addCompany(_ company: Company, to watchlist: Watchlist) async {
        await updateWatchlist(statusKey: "watchlists.status.added", company: company, watchlist: watchlist) {
            try await self.api.addCompany(company.id, toWatchlist: watchlist.id)
        }
    }

    func removeCompany(_ company: Company, from watchlist: Watchlist) async {
        await updateWatchlist(statusKey: "watchlists.status.removed", company: company, watchlist: watchlist) {
            try await self.api.removeCompany(company.id, fromWatchlist: watchlist.id)
        }
    }

    /// The list only changes once the server has answered with the updated watchlist.
    private func updateWatchlist(statusKey: String, company: Company, watchlist: Watchlist, _ call: () async throws -> Watchlist) async {
        watchlistStatus = nil
        watchlistError = nil
        do {
            let updated = try await call()
            if let index = watchlists.firstIndex(where: { $0.id == updated.id }) {
                watchlists[index] = updated
            }
            watchlistStatus = statusKey.localizedFormat(company.name, watchlist.name)
        } catch let error as ApiError {
            watchlistError = error
        } catch {
            watchlistError = .network
        }
    }

    func startAlert(for company: Company) {
        alertCompanyId = company.id
        page = .alerts
    }
}
