import SwiftUI

struct WatchlistsView: View {
    @Environment(BankingStore.self) private var store

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                ScreenTitle(title: "watchlists.title".localizedString)

                if store.loading {
                    ProgressView().controlSize(.large).frame(maxWidth: .infinity).padding(40)
                } else if let loadError = store.loadError {
                    Banner(kind: .error, heading: "watchlists.load_error.title".localizedString) {
                        Text(loadError.message)
                        ReferenceId(error: loadError)
                    }
                    Button("common.retry".localized) {
                        store.loading = true
                        Task { await store.refresh() }
                    }
                    .buttonStyle(OutlineButtonStyle())
                } else {
                    IndexStrip(indices: store.indices)
                    ForEach(store.watchlists) { watchlist in
                        Card {
                            SectionHeader(title: watchlist.name, trailing: watchlist.countLabel)
                            ForEach(watchlist.companies) { company in
                                NavigationLink(value: company) { CompanyRow(company: company) }
                                    .buttonStyle(.plain)
                            }
                        }
                    }
                }
                Footer()
            }
            .padding(20)
        }
        .background(Theme.surface)
        .navigationDestination(for: Company.self) { company in CompanyView(company: company) }
        .toolbar(.hidden, for: .navigationBar)
        .refreshable { await store.refresh() }
    }
}

struct IndexStrip: View {
    let indices: [MarketIndex]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 12) {
                ForEach(indices) { index in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(index.name)
                            .font(.footnote.weight(.semibold)).foregroundStyle(Theme.muted)
                            .lineLimit(2, reservesSpace: true)
                            .multilineTextAlignment(.leading)
                        Text(Format.number(index.value)).font(.title3.weight(.semibold)).foregroundStyle(Theme.ink)
                        ChangeText(pct: index.changePct)
                    }
                    .padding(14)
                    .frame(width: 160, alignment: .leading)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Theme.line))
                    .accessibilityElement(children: .combine)
                }
            }
            .padding(.horizontal, 20)
        }
        .padding(.horizontal, -20)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("watchlists.indices.accessibility".localized)
    }
}

struct CompanyRow: View {
    let company: Company

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text(company.ticker).font(.body.weight(.bold)).foregroundStyle(Theme.ink)
                Text(company.name).font(.subheadline).foregroundStyle(Theme.text)
                HStack(spacing: 8) {
                    RatingChip(rating: company.rating)
                    Text(company.outlook).font(.footnote).foregroundStyle(Theme.muted)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 6) {
                Text(Format.price(company.price)).font(.body.weight(.semibold)).foregroundStyle(Theme.ink)
                ChangeText(pct: company.changePct)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .contentShape(Rectangle())
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
        .accessibilityElement(children: .combine)
    }
}
