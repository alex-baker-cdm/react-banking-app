import SwiftUI

struct WatchlistsView: View {
    @Environment(BankingStore.self) private var store
    @State private var addingTo: Watchlist?
    @State private var removal: Removal?

    struct Removal: Identifiable {
        let company: Company
        let watchlist: Watchlist
        var id: String { watchlist.id + "/" + company.id }
    }

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
                            WatchlistHeader(watchlist: watchlist) { addingTo = watchlist }
                            if watchlist.companies.isEmpty {
                                Text("watchlists.empty".localized)
                                    .font(.subheadline).foregroundStyle(Theme.muted)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(16)
                            }
                            ForEach(watchlist.companies) { company in
                                HStack(spacing: 0) {
                                    NavigationLink(value: company) { CompanyRow(company: company) }
                                        .buttonStyle(.plain)
                                    Button {
                                        removal = Removal(company: company, watchlist: watchlist)
                                    } label: {
                                        Image(systemName: "trash")
                                            .font(.body)
                                            .foregroundStyle(Theme.muted)
                                            .frame(width: 48, height: 48)
                                            .contentShape(Rectangle())
                                    }
                                    .buttonStyle(.plain)
                                    .padding(.trailing, 4)
                                    .accessibilityLabel("watchlists.remove_button.accessibility".localizedFormat(company.name, watchlist.name))
                                }
                                .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
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
        .safeAreaInset(edge: .top, spacing: 0) {
            VStack(spacing: 8) {
                if let status = store.watchlistStatus {
                    Text(status)
                        .font(.subheadline).foregroundStyle(Theme.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(Theme.successBackground)
                        .overlay(alignment: .leading) { Rectangle().fill(Theme.positive).frame(width: 6) }
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Theme.line))
                        .accessibilityAddTraits(.updatesFrequently)
                }
                if let error = store.watchlistError {
                    Banner(kind: .error, heading: "watchlists.update_error.title".localizedString) {
                        Text(error.isServerError ? "watchlists.update_error.message".localizedString : error.message)
                        ReferenceId(error: error)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, store.watchlistStatus == nil && store.watchlistError == nil ? 0 : 8)
            .frame(maxWidth: .infinity)
            .background(Theme.surface)
        }
        .sheet(item: $addingTo) { watchlist in
            AddCompanySheet(watchlist: watchlist, companies: store.companiesAvailable(for: watchlist)) { company in
                addingTo = nil
                Task { await store.addCompany(company, to: watchlist) }
            }
        }
        .alert(
            removal.map { "watchlists.remove.confirm_title".localizedFormat($0.company.name, $0.watchlist.name) } ?? "",
            isPresented: Binding(get: { removal != nil }, set: { if !$0 { removal = nil } }),
            presenting: removal
        ) { pending in
            Button("watchlists.remove.confirm_button".localized, role: .destructive) {
                Task { await store.removeCompany(pending.company, from: pending.watchlist) }
            }
            Button("common.cancel".localized, role: .cancel) {}
        }
        .onChange(of: store.watchlistStatus) { _, status in
            if let status { AccessibilityNotification.Announcement(status).post() }
        }
        .onChange(of: store.watchlistError) { _, error in
            if let error {
                AccessibilityNotification.Announcement(
                    error.isServerError ? "watchlists.update_error.message".localizedString : error.message
                ).post()
            }
        }
    }
}

struct WatchlistHeader: View {
    let watchlist: Watchlist
    let onAdd: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(watchlist.name).font(.headline).foregroundStyle(Theme.ink)
                    .accessibilityAddTraits(.isHeader)
                Text(watchlist.countLabel).font(.subheadline).foregroundStyle(Theme.muted)
            }
            Spacer()
            Button(action: onAdd) {
                Label("watchlists.add_company_button".localized, systemImage: "plus")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.link)
                    .frame(minHeight: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("watchlists.add_company_button.accessibility".localizedFormat(watchlist.name))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 6)
        .background(Color(hex: 0xFAFAFA))
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
    }
}

struct AddCompanySheet: View {
    let watchlist: Watchlist
    let companies: [Company]
    let onChoose: (Company) -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""

    static func matches(_ companies: [Company], query: String) -> [Company] {
        let term = query.trimmingCharacters(in: .whitespaces)
        guard !term.isEmpty else { return companies }
        return companies.filter {
            $0.name.localizedCaseInsensitiveContains(term) || $0.ticker.localizedCaseInsensitiveContains(term)
        }
    }

    var body: some View {
        let results = Self.matches(companies, query: query)
        NavigationStack {
            Group {
                if companies.isEmpty {
                    message("watchlists.add.all_added")
                } else if results.isEmpty {
                    message("watchlists.add.no_results")
                } else {
                    List(results) { company in
                        Button { onChoose(company) } label: {
                            HStack(spacing: 12) {
                                Text(company.ticker).font(.body.weight(.bold)).foregroundStyle(Theme.ink)
                                    .frame(width: 56, alignment: .leading)
                                Text(company.name).font(.subheadline).foregroundStyle(Theme.text)
                                Spacer()
                                RatingChip(rating: company.rating)
                            }
                            .frame(minHeight: 44)
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .accessibilityElement(children: .combine)
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("watchlists.add.title".localizedFormat(watchlist.name))
            .navigationBarTitleDisplayMode(.inline)
            .searchable(
                text: $query,
                placement: .navigationBarDrawer(displayMode: .always),
                prompt: Text("watchlists.add.search_placeholder".localized)
            )
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized) { dismiss() }
                }
            }
        }
        .tint(Theme.link)
    }

    private func message(_ key: String) -> some View {
        Text(key.localized)
            .font(.subheadline).foregroundStyle(Theme.muted)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(24)
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
        .accessibilityElement(children: .combine)
    }
}
