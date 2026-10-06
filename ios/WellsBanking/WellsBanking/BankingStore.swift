import Foundation
import Observation

enum Page: Hashable {
    case accounts, transfer
}

struct TransferPrefill: Equatable {
    let toAccountId: String
    let amount: Double
    let sourceLabel: String
}

@Observable
final class BankingStore {
    var signedOn = false
    var page: Page = .accounts
    var accounts: [Account] = []
    var loading = true
    var loadError: String?
    var transferPrefill: TransferPrefill?

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

    func payMinimumDue(for account: Account) {
        guard let amount = account.minimumDueAmount else { return }
        transferPrefill = TransferPrefill(
            toAccountId: account.id,
            amount: amount,
            sourceLabel: "\(account.name) ...\(account.lastFour)"
        )
        page = .transfer
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
