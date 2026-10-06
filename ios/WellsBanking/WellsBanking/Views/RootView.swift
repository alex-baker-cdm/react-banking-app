import SwiftUI

struct RootView: View {
    @Environment(BankingStore.self) private var store

    var body: some View {
        @Bindable var store = store
        if !store.signedOn {
            SignOnView()
        } else {
            VStack(spacing: 0) {
                AppHeader { store.signedOn = false }
                TabView(selection: $store.page) {
                    NavigationStack { AccountsView() }
                        .tabItem { Label("Accounts", systemImage: "building.columns") }
                        .tag(Page.accounts)
                    NavigationStack { TransferView() }
                        .tabItem { Label("Transfer & Pay", systemImage: "arrow.left.arrow.right") }
                        .tag(Page.transfer)
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
            AppHeader()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Sign On").font(.largeTitle.weight(.semibold)).foregroundStyle(Theme.ink)
                    Text("Demo environment - any username and password will sign you on.")
                        .font(.subheadline).foregroundStyle(Theme.muted)
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Username").font(.subheadline.weight(.semibold))
                        TextField("", text: $username)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .textFieldStyle(.roundedBorder)
                            .accessibilityLabel("Username")
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password").font(.subheadline.weight(.semibold))
                        SecureField("", text: $password)
                            .textFieldStyle(.roundedBorder)
                            .accessibilityLabel("Password")
                    }
                    if let error {
                        Text(error).font(.subheadline.weight(.medium)).foregroundStyle(Theme.red)
                    }
                    Button("Sign On") {
                        guard !username.trimmingCharacters(in: .whitespaces).isEmpty, !password.isEmpty else {
                            error = "Enter your username and password."
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
                .overlay(alignment: .top) { Rectangle().fill(Theme.red).frame(height: 6) }
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Theme.line))
                .padding(20)
                .padding(.top, 24)
            }
            .background(Theme.surface)
        }
        .background(Theme.surface.ignoresSafeArea())
    }
}
