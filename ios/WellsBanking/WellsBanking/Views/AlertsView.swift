import SwiftUI

struct AlertsView: View {
    @Environment(BankingStore.self) private var store
    @State private var companyId = ""
    @State private var type: AlertType = .rating
    @State private var direction: AlertDirection = .above
    @State private var threshold = ""
    @State private var note = ""
    @State private var submitting = false
    @State private var fieldError: ApiError?
    @State private var failure: ApiError?
    @State private var created: MarketAlert?
    @State private var removeFailure: ApiError?
    @FocusState private var keyboardFocused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ScreenTitle(title: "alerts.title".localizedString)

                if let created {
                    Banner(kind: .success, heading: "alerts.created.title".localizedString) { Text(created.summary) }
                }
                if let failure {
                    Banner(kind: .error, heading: "alerts.create_error.title".localizedString) {
                        Text(failure.isServerError ? "alerts.create_error.message".localizedString : failure.message)
                        ReferenceId(error: failure)
                    }
                }
                form

                Card {
                    SectionHeader(title: "alerts.list.title".localizedString)
                    if let removeFailure {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(removeFailure.isServerError ? "alerts.list.remove_error.message".localizedString : removeFailure.message)
                                .font(.footnote.weight(.medium)).foregroundStyle(Theme.negative)
                            ReferenceId(error: removeFailure)
                        }
                        .padding(16)
                    }
                    if store.alerts.isEmpty {
                        Text("alerts.list.empty".localized).font(.subheadline).foregroundStyle(Theme.muted).padding(16)
                    }
                    ForEach(store.alerts) { alert in
                        HStack(alignment: .top, spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(alert.summary).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.ink)
                                if let note = alert.note, !note.isEmpty {
                                    Text(note).font(.footnote).foregroundStyle(Theme.text)
                                }
                                Text("alerts.list.created_on".localizedFormat(Format.date(alert.createdAt))).font(.footnote).foregroundStyle(Theme.muted)
                            }
                            .accessibilityElement(children: .combine)
                            Spacer()
                            Button("alerts.list.remove_button".localized) { Task { await remove(alert) } }
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.link)
                                .frame(minWidth: 44, minHeight: 44)
                                .accessibilityLabel("alerts.list.remove_button.accessibility".localizedFormat(alert.summary))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .overlay(alignment: .bottom) { Rectangle().fill(Theme.line).frame(height: 1) }
                    }
                }
                Footer()
            }
            .padding(20)
        }
        .background(Theme.surface)
        .toolbar(.hidden, for: .navigationBar)
        .scrollDismissesKeyboard(.interactively)
        .toolbar {
            ToolbarItemGroup(placement: .keyboard) {
                Spacer()
                Button("common.done".localized) { keyboardFocused = false }
            }
        }
        .onAppear(perform: applyPreselection)
        .onChange(of: store.alertCompanyId) { _, _ in applyPreselection() }
        .onChange(of: companyId) { _, _ in if fieldError?.field == "companyId" { fieldError = nil } }
    }

    private var form: some View {
        Card {
            VStack(alignment: .leading, spacing: 18) {
                field("alerts.form.company".localizedString, error: message(for: "companyId")) {
                    Picker("alerts.form.company".localized, selection: $companyId) {
                        Text("alerts.form.company.placeholder".localized).tag("")
                        ForEach(store.companies) { company in
                            Text("alerts.form.company.option".localizedFormat(company.ticker, company.name)).tag(company.id)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(Theme.link)
                    .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                    .overlay(RoundedRectangle(cornerRadius: 4).stroke(Theme.muted))
                }
                field("alerts.form.type".localizedString, error: message(for: "type")) {
                    Picker("alerts.form.type".localized, selection: $type) {
                        ForEach(AlertType.allCases) { Text($0.label).tag($0) }
                    }
                    .pickerStyle(.segmented)
                }
                if type == .price {
                    field("alerts.form.direction".localizedString, error: message(for: "direction")) {
                        Picker("alerts.form.direction".localized, selection: $direction) {
                            ForEach(AlertDirection.allCases) { Text($0.label).tag($0) }
                        }
                        .pickerStyle(.segmented)
                    }
                    field("alerts.form.price".localizedString, error: message(for: "threshold")) {
                        HStack {
                            Text("$").foregroundStyle(Theme.muted).accessibilityHidden(true)
                            TextField("0.00", text: $threshold).keyboardType(.decimalPad).focused($keyboardFocused).accessibilityLabel("alerts.form.price".localized)
                        }
                        .padding(.horizontal, 12)
                        .frame(height: 44)
                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(Theme.muted))
                    }
                }
                field("alerts.form.note".localizedString, error: message(for: "note")) {
                    TextField("", text: $note)
                        .focused($keyboardFocused)
                        .submitLabel(.done)
                        .padding(.horizontal, 12)
                        .frame(height: 44)
                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(Theme.muted))
                        .accessibilityLabel("alerts.form.note".localized)
                }
                Button((submitting ? "alerts.form.submitting" : "alerts.form.submit_button").localized) { Task { await submit() } }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(submitting)
            }
            .padding(20)
        }
    }

    private func message(for field: String) -> String? {
        fieldError?.field == field ? fieldError?.message : nil
    }

    private func field<Content: View>(_ label: String, error: String?, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.ink)
            content()
            if let error {
                Text(error).font(.footnote.weight(.medium)).foregroundStyle(Theme.negative)
            }
        }
    }

    private func applyPreselection() {
        guard let id = store.alertCompanyId else { return }
        companyId = id
        created = nil
        failure = nil
        fieldError = nil
        store.alertCompanyId = nil
    }

    private func submit() async {
        keyboardFocused = false
        submitting = true
        fieldError = nil
        failure = nil
        created = nil
        defer { submitting = false }
        let request = AlertRequest(
            companyId: companyId,
            type: type.rawValue,
            direction: type == .price ? direction.rawValue : nil,
            threshold: type == .price ? threshold : nil,
            note: note
        )
        do {
            created = try await store.createAlert(request)
            threshold = ""
            note = ""
        } catch let error as ApiError {
            if error.isServerError || error.field == nil { failure = error } else { fieldError = error }
        } catch {
            failure = .network
        }
    }

    private func remove(_ alert: MarketAlert) async {
        removeFailure = nil
        do {
            try await store.removeAlert(alert)
            if created?.id == alert.id { created = nil }
        } catch let error as ApiError {
            removeFailure = error
        } catch {
            removeFailure = .network
        }
    }
}
