import SwiftUI

struct CompanyView: View {
    @Environment(BankingStore.self) private var store
    let company: Company
    @State private var actions: [RatingAction] = []
    @State private var loading = true
    @State private var error: ApiError?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ScreenTitle(title: company.name)
                Text("company.ticker_sector".localizedFormat(company.ticker, company.sector)).font(.subheadline).foregroundStyle(Theme.muted)

                Card {
                    value("company.rating".localizedString, company.rating)
                    value("company.outlook".localizedString, company.outlook)
                    value("company.price".localizedString, Format.price(company.price))
                    value("company.market_cap".localizedString, Format.marketCap(company.marketCapBn))
                }

                Button("company.create_alert_button".localized) { store.startAlert(for: company) }
                    .buttonStyle(PrimaryButtonStyle())

                if let error {
                    Banner(kind: .error, heading: "company.rating_actions.load_error.title".localizedString) {
                        Text(error.message)
                        ReferenceId(error: error)
                    }
                }
                Card {
                    SectionHeader(title: "company.rating_actions.title".localizedString)
                    if loading {
                        ProgressView().frame(maxWidth: .infinity).padding(24)
                    } else if actions.isEmpty, error == nil {
                        Text("company.rating_actions.empty".localized).font(.subheadline).foregroundStyle(Theme.muted).padding(16)
                    }
                    ForEach(actions) { action in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(Format.date(action.date)).font(.footnote).foregroundStyle(Theme.muted)
                            HStack(spacing: 8) {
                                Text(action.action).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.ink)
                                Text(action.ratingChange).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.ink)
                                    .accessibilityLabel(action.spokenRatingChange)
                            }
                            Text(action.summary).font(.subheadline).foregroundStyle(Theme.text)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
                        .accessibilityElement(children: .combine)
                    }
                }
            }
            .padding(20)
        }
        .background(Theme.surface)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do { actions = try await store.ratingActions(for: company) }
            catch let apiError as ApiError { error = apiError }
            catch { self.error = .network }
            loading = false
        }
    }

    private func value(_ label: String, _ text: String) -> some View {
        HStack {
            Text(label).font(.subheadline).foregroundStyle(Theme.muted)
            Spacer()
            Text(text).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.ink)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
        .accessibilityElement(children: .combine)
    }
}
