import Foundation

enum AccountType: String, Codable {
    case checking, savings, credit, loan

    var label: String {
        switch self {
        case .checking: return "Checking"
        case .savings: return "Savings"
        case .credit: return "Credit card"
        case .loan: return "Mortgage"
        }
    }

    var isDeposit: Bool { self == .checking || self == .savings }
}

struct Account: Codable, Identifiable, Hashable {
    let id: String
    let type: AccountType
    let name: String
    let lastFour: String
    let currentBalance: Double
    let availableBalance: Double?
    let availableCredit: Double?
    let creditLimit: Double?
    let minimumPaymentDue: Double?
    let nextPaymentAmount: Double?
    let paymentDueDate: String?
    let apy: Double?

    var headlineBalance: Double { type.isDeposit ? (availableBalance ?? currentBalance) : currentBalance }

    var minimumDueAmount: Double? {
        let due: Double?
        switch type {
        case .credit: due = minimumPaymentDue
        case .loan: due = nextPaymentAmount
        case .checking, .savings: due = nil
        }
        guard let due, due > 0 else { return nil }
        return due
    }

    var headlineLabel: String {
        switch type {
        case .checking, .savings: return "Available balance"
        case .credit: return "Current balance"
        case .loan: return "Principal balance"
        }
    }
}

struct Transaction: Codable, Identifiable, Hashable {
    let id: String
    let accountId: String
    let postedAt: String
    let description: String
    let amount: Double
}

struct TransferRequest: Encodable {
    let fromAccountId: String
    let toAccountId: String
    let amount: String
    let memo: String
}

struct TransferReceipt: Decodable {
    let confirmationNumber: String
    let postedAt: String
    let amount: Double
    let memo: String?
    let from: Account
    let to: Account
}

struct AccountsResponse: Decodable { let accounts: [Account] }
struct AccountResponse: Decodable { let account: Account }
struct TransactionsResponse: Decodable { let transactions: [Transaction] }
struct TransferResponse: Decodable { let transfer: TransferReceipt }
