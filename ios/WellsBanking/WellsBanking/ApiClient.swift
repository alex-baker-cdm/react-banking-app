import Foundation

struct ApiError: Error, Equatable {
    let status: Int
    let code: String?
    let message: String
    let field: String?
    let correlationId: String?

    static let network = ApiError(status: 0, code: "NETWORK", message: "Network error. Please try again.", field: nil, correlationId: nil)
    var isServerError: Bool { status >= 500 || status == 0 }
}

private struct ErrorEnvelope: Decodable {
    struct Body: Decodable {
        let code: String?
        let message: String?
        let field: String?
        let correlationId: String?
    }
    let error: Body?
}

struct ApiClient {
    let baseUrl: URL

    static let shared = ApiClient(baseUrl: ApiClient.configuredBaseUrl())

    static func configuredBaseUrl() -> URL {
        if let override = ProcessInfo.processInfo.environment["BANKING_API_BASE_URL"], let url = URL(string: override) {
            return url
        }
        if let configured = Bundle.main.object(forInfoDictionaryKey: "ApiBaseUrl") as? String, let url = URL(string: configured) {
            return url
        }
        return URL(string: "http://localhost:8080")!
    }

    func accounts() async throws -> [Account] {
        try await send(AccountsResponse.self, makeRequest(path: "/api/accounts")).accounts
    }

    func account(id: String) async throws -> Account {
        try await send(AccountResponse.self, makeRequest(path: "/api/accounts/\(id)")).account
    }

    func transactions(accountId: String) async throws -> [Transaction] {
        try await send(TransactionsResponse.self, makeRequest(path: "/api/accounts/\(accountId)/transactions")).transactions
    }

    func transfer(_ body: TransferRequest) async throws -> TransferReceipt {
        var request = makeRequest(path: "/api/transfers")
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONEncoder().encode(body)
        return try await send(TransferResponse.self, request).transfer
    }

    private func makeRequest(path: String) -> URLRequest {
        var request = URLRequest(url: baseUrl.appendingPathComponent(path))
        request.setValue("application/json", forHTTPHeaderField: "accept")
        request.timeoutInterval = 15
        return request
    }

    private func send<T: Decodable>(_ type: T.Type, _ request: URLRequest) async throws -> T {
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw ApiError.network
        }
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else {
            let envelope = try? JSONDecoder().decode(ErrorEnvelope.self, from: data)
            throw ApiError(
                status: status,
                code: envelope?.error?.code,
                message: envelope?.error?.message ?? "Request failed with status \(status)",
                field: envelope?.error?.field,
                correlationId: envelope?.error?.correlationId
            )
        }
        do {
            return try JSONDecoder().decode(type, from: data)
        } catch {
            throw ApiError(status: status, code: "DECODE", message: "Unexpected response from the server.", field: nil, correlationId: nil)
        }
    }
}
