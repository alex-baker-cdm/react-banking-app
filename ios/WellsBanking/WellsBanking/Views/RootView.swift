import SwiftUI

struct RootView: View {
    @Environment(BankingStore.self) private var store

    var body: some View {
        @Bindable var store = store
        if !store.signedOn {
            SignOnView()
        } else {
            VStack(spacing: 0) {
                AppHeader { store.signOff() }
                TabView(selection: $store.page) {
                    NavigationStack { WatchlistsView() }
                        .tabItem { Label("tab_bar.watchlists".localized, systemImage: "list.bullet.rectangle") }
                        .tag(Page.watchlists)
                    NavigationStack { AlertsView() }
                        .tabItem { Label("tab_bar.alerts".localized, systemImage: "bell") }
                        .tag(Page.alerts)
                }
            }
            .background(Theme.surface.ignoresSafeArea())
            .task { await store.refresh() }
        }
    }
}

struct SignOnView: View {
    @Environment(BankingStore.self) private var store
    @State private var username = ""
    @State private var password = ""
    @State private var error: String?

    var body: some View {
        VStack(spacing: 0) {
            AppHeader(showsProduct: false)
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("sign_in.title".localized).font(.largeTitle.weight(.semibold)).foregroundStyle(Theme.ink)
                        .accessibilityAddTraits(.isHeader)
                    VStack(alignment: .leading, spacing: 6) {
                        Text("sign_in.username".localized).font(.subheadline.weight(.semibold))
                        TextField("", text: $username)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .textFieldStyle(.roundedBorder)
                            .accessibilityLabel("sign_in.username".localized)
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        Text("sign_in.password".localized).font(.subheadline.weight(.semibold))
                        SecureField("", text: $password)
                            .textFieldStyle(.roundedBorder)
                            .accessibilityLabel("sign_in.password".localized)
                    }
                    if let error {
                        Text(error).font(.subheadline.weight(.medium)).foregroundStyle(Theme.negative)
                    }
                    Button("sign_in.submit_button".localized) {
                        guard !username.trimmingCharacters(in: .whitespaces).isEmpty, !password.isEmpty else {
                            error = "sign_in.missing_credentials".localizedString
                            return
                        }
                        error = nil
                        store.signedOn = true
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .padding(.top, 8)
                }
                .padding(24)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Theme.line))
                .padding(20)
                .padding(.top, 24)
                Footer()
            }
            .background(Theme.surface)
        }
        .background(Theme.surface.ignoresSafeArea())
    }
}
