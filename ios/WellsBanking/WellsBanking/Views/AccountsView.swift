import SwiftUI

struct AccountsView: View {
    @Environment(BankingStore.self) private var store

    private var deposits: [Account] { store.accounts.filter { $0.type.isDeposit } }
    private var credit: [Account] { store.accounts.filter { !$0.type.isDeposit } }
    private var cashTotal: Double { deposits.reduce(0) { $0 + $1.headlineBalance } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Account Summary").font(.title.weight(.semibold)).foregroundStyle(Theme.ink)

                if store.loading {
                    ProgressView().controlSize(.large).frame(maxWidth: .infinity).padding(40)
                } else if let loadError = store.loadError {
                    Banner(kind: .error, heading: "We couldn't load your accounts") {
                        Text(loadError)
                        Text("API: \(ApiClient.shared.baseUrl.absoluteString)").font(.system(size: 12, design: .monospaced))
                    }
                    Button("Retry") {
                        store.loading = true
                        Task { await store.refresh() }
                    }
                    .buttonStyle(OutlineButtonStyle())
                } else {
                    Card {
                        SectionHeader(title: "Cash accounts", trailing: "\(Format.money(cashTotal)) available")
                        ForEach(deposits) { account in
                            NavigationLink(value: account) { AccountRow(account: account) }
                        }
                    }
                    Card {
                        SectionHeader(title: "Credit cards & loans")
                        ForEach(credit) { account in
                            NavigationLink(value: account) { AccountRow(account: account) }
                        }
                    }
                    Footer()
                }
            }
            .padding(20)
        }
        .background(Theme.surface)
        .navigationDestination(for: Account.self) { account in AccountDetailView(account: account) }
        .toolbar(.hidden, for: .navigationBar)
        .refreshable { await store.refresh() }
    }
}

struct AccountRow: View {
    let account: Account

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(account.type.label.uppercased())
                    .font(.system(size: 11, weight: .medium)).kerning(0.8).foregroundStyle(Theme.muted)
                (Text(account.name).font(.body.weight(.semibold)).foregroundStyle(Theme.link)
                    + Text("  ...\(account.lastFour)").font(.footnote).foregroundStyle(Theme.muted))
                if account.type == .credit, let due = account.paymentDueDate {
                    Text("Minimum payment \(Format.money(account.minimumPaymentDue ?? 0)) due \(Format.date(due))")
                        .font(.footnote).foregroundStyle(Theme.muted)
                }
                if account.type == .loan, let due = account.paymentDueDate {
                    Text("Next payment \(Format.money(account.nextPaymentAmount ?? 0)) due \(Format.date(due))")
                        .font(.footnote).foregroundStyle(Theme.muted)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(Format.money(account.headlineBalance)).font(.title3.weight(.semibold)).foregroundStyle(Theme.ink)
                Text(account.headlineLabel).font(.footnote).foregroundStyle(Theme.muted)
                if account.type == .credit, let available = account.availableCredit {
                    Text("\(Format.money(available)) available credit").font(.footnote).foregroundStyle(Theme.muted)
                }
            }
        }
        .padding(16)
        .contentShape(Rectangle())
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
    }
}

struct AccountDetailView: View {
    @Environment(BankingStore.self) private var store
    let account: Account
    @State private var transactions: [Transaction] = []
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                (Text(account.name).font(.title2.weight(.semibold)).foregroundStyle(Theme.ink)
                    + Text("  ...\(account.lastFour)").font(.subheadline).foregroundStyle(Theme.muted))
                (Text(Format.money(account.headlineBalance)).font(.title.weight(.semibold)).foregroundStyle(Theme.ink)
                    + Text("  \(account.headlineLabel.lowercased())").font(.subheadline).foregroundStyle(Theme.muted))
                if let minimumDue = account.minimumDueAmount {
                    Card {
                        SectionHeader(title: "Quick actions")
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Minimum due \(Format.money(minimumDue))\(account.paymentDueDate.map { " by \(Format.date($0))" } ?? "")")
                                .font(.subheadline).foregroundStyle(Theme.muted)
                            Button("Pay minimum due") { store.payMinimumDue(for: account) }
                                .buttonStyle(PrimaryButtonStyle())
                                .accessibilityIdentifier("payMinimumDue")
                        }
                        .padding(16)
                    }
                }
                if let error {
                    Banner(kind: .error, heading: "We couldn't load activity") { Text(error) }
                }
                Card {
                    SectionHeader(title: "Activity")
                    ForEach(transactions) { txn in
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(txn.description).font(.subheadline).foregroundStyle(Theme.ink)
                                Text(Format.date(txn.postedAt)).font(.footnote).foregroundStyle(Theme.muted)
                            }
                            Spacer()
                            Text(Format.money(txn.amount))
                                .font(.subheadline.weight(txn.amount < 0 ? .regular : .semibold))
                                .foregroundStyle(txn.amount < 0 ? Theme.ink : Theme.green)
                        }
                        .padding(16)
                        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
                    }
                }
            }
            .padding(20)
        }
        .background(Theme.surface)
        .navigationTitle("Account")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do { transactions = try await store.transactions(for: account) }
            catch let apiError as ApiError { error = apiError.message }
            catch { self.error = error.localizedDescription }
        }
    }
}
