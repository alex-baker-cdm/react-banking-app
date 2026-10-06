import SwiftUI

@main
struct WellsBankingApp: App {
    @State private var store = BankingStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .tint(Theme.red)
        }
    }
}
