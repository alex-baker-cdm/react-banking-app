import SwiftUI

struct TransferView: View {
    @Environment(BankingStore.self) private var store
    @State private var fromAccountId = ""
    @State private var toAccountId = ""
    @State private var amount = ""
    @State private var memo = ""
    @State private var submitting = false
    @State private var fieldError: ApiError?
    @State private var receipt: TransferReceipt?
    @State private var failure: ApiError?
    @State private var prefillNote: String?
    @State private var pendingPrefill: TransferPrefill?

    private var fromOptions: [Account] { store.accounts.filter { $0.type.isDeposit } }
    private var toOptions: [Account] { store.accounts.filter { $0.id != fromAccountId } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Transfer & Pay").font(.title.weight(.semibold)).foregroundStyle(Theme.ink)
                Text("Move money between your accounts or make a payment.").font(.subheadline).foregroundStyle(Theme.muted)

                if let receipt {
                    Banner(kind: .success, heading: "Transfer complete") {
                        Text("\(Format.money(receipt.amount)) moved from \(receipt.from.name) ...\(receipt.from.lastFour) to \(receipt.to.name) ...\(receipt.to.lastFour) on \(Format.date(receipt.postedAt)).")
                        Text("Confirmation number \(receipt.confirmationNumber)").font(.footnote).foregroundStyle(Theme.muted)
                    }
                    Button("Make another transfer") { reset() }.buttonStyle(OutlineButtonStyle())
                } else if let failure {
                    Banner(kind: .error, heading: "We couldn't complete your transfer") {
                        Text(failure.message)
                        if let ref = failure.correlationId {
                            Text("Reference ID \(ref)").font(.footnote).foregroundStyle(Theme.muted)
                        }
                    }
                    Button("Try again") { reset() }.buttonStyle(OutlineButtonStyle())
                } else {
                    form
                }
                Footer()
            }
            .padding(20)
        }
        .background(Theme.surface)
        .toolbar(.hidden, for: .navigationBar)
        .scrollDismissesKeyboard(.interactively)
        .onAppear {
            if fromAccountId.isEmpty { fromAccountId = fromOptions.first?.id ?? "" }
            applyPrefill()
        }
        .onChange(of: store.transferPrefill) { _, _ in applyPrefill() }
    }

    private var form: some View {
        Card {
            VStack(alignment: .leading, spacing: 18) {
                if let prefillNote {
                    Label(prefillNote, systemImage: "bolt.fill")
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(Theme.green)
                        .accessibilityIdentifier("prefillNote")
                }
                field("From", error: fieldError?.field == "fromAccountId" ? fieldError?.message : nil) {
                    Picker("From", selection: $fromAccountId) {
                        ForEach(fromOptions) { account in
                            Text("\(account.name) ...\(account.lastFour)").tag(account.id)
                        }
                    }
                    .pickerStyle(.menu)
                    .onChange(of: fromAccountId) { _, newValue in
                        if toAccountId == newValue { toAccountId = "" }
                    }
                }
                field("To", error: fieldError?.field == "toAccountId" ? fieldError?.message : nil) {
                    Picker("To", selection: $toAccountId) {
                        Text("Select an account").tag("")
                        ForEach(toOptions) { account in
                            Text("\(account.name) ...\(account.lastFour)").tag(account.id)
                        }
                    }
                    .pickerStyle(.menu)
                }
                field("Amount", error: fieldError?.field == "amount" ? fieldError?.message : nil) {
                    HStack {
                        Text("$").foregroundStyle(Theme.muted)
                        TextField("0.00", text: $amount).keyboardType(.decimalPad).accessibilityLabel("Amount")
                    }
                    .padding(.horizontal, 12)
                    .frame(height: 44)
                    .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color(hex: 0x8A8A8A)))
                }
                field("Memo (optional)", error: nil) {
                    TextField("e.g. October payment", text: $memo)
                        .padding(.horizontal, 12)
                        .frame(height: 44)
                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color(hex: 0x8A8A8A)))
                        .accessibilityLabel("Memo")
                }
                Button(submitting ? "Submitting…" : "Transfer") { Task { await submit() } }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(submitting)
            }
            .padding(20)
        }
    }

    private func field<Content: View>(_ label: String, error: String?, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.ink)
            content()
            if let error {
                Text(error).font(.footnote.weight(.medium)).foregroundStyle(Theme.red)
            }
        }
    }

    private func submit() async {
        submitting = true
        fieldError = nil
        defer { submitting = false }
        do {
            receipt = try await store.transfer(TransferRequest(fromAccountId: fromAccountId, toAccountId: toAccountId, amount: amount, memo: memo))
        } catch let error as ApiError {
            if error.isServerError { failure = error } else { fieldError = error }
        } catch {
            failure = ApiError(status: 0, code: "UNKNOWN", message: error.localizedDescription, field: nil, correlationId: nil)
        }
    }

    private func reset() {
        receipt = nil
        failure = nil
        fieldError = nil
        prefillNote = nil
        amount = ""
        memo = ""
        toAccountId = ""
        if let prefill = pendingPrefill {
            pendingPrefill = nil
            fill(prefill)
        }
    }

    private func applyPrefill() {
        guard let prefill = store.transferPrefill else { return }
        store.transferPrefill = nil
        if submitting || receipt != nil || failure != nil {
            pendingPrefill = prefill
            return
        }
        reset()
        fill(prefill)
    }

    private func fill(_ prefill: TransferPrefill) {
        if fromAccountId.isEmpty || fromAccountId == prefill.toAccountId {
            fromAccountId = fromOptions.first?.id ?? ""
        }
        toAccountId = prefill.toAccountId
        amount = String(format: "%.2f", prefill.amount)
        memo = "Minimum payment"
        prefillNote = "Prefilled from Pay minimum due on \(prefill.sourceLabel)"
    }
}
