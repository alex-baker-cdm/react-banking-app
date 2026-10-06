import Foundation
import Observation

enum Page: Hashable {
    case accounts, transfer
}

@Observable
final class BankingStore {
    var signedOn = false
    var page: Page = .accounts
    var accounts: [Account] = []
    var loading = true
    var loadError: String?

    private let api = ApiClient.shared

    func refresh() async {
        do {
            accounts = try await api.accounts()
            loadError = nil
        } catch let error as ApiError {
            loadError = error.message
        } catch {
            loadError = error.localizedDescription
        }
        loading = false
    }

    func transactions(for account: Account) async throws -> [Transaction] {
        try await api.transactions(accountId: account.id)
    }

    func transfer(_ request: TransferRequest) async throws -> TransferReceipt {
        let receipt = try await api.transfer(request)
        await refresh()
        return receipt
    }
}
