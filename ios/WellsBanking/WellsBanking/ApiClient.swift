import Foundation

struct ApiError: Error, Equatable {
    let status: Int
    let code: String?
    let message: String
    let field: String?
    let correlationId: String?

    static var network: ApiError { ApiError(status: 0, code: "NETWORK", message: "common.network_error".localizedString, field: nil, correlationId: nil) }
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

    func indices() async throws -> [MarketIndex] {
        try await send(IndicesResponse.self, makeRequest(path: "/api/indices")).indices
    }

    func companies() async throws -> [Company] {
        try await send(CompaniesResponse.self, makeRequest(path: "/api/companies")).companies
    }

    func watchlists() async throws -> [Watchlist] {
        try await send(WatchlistsResponse.self, makeRequest(path: "/api/watchlists")).watchlists
    }

    func ratingActions(companyId: String) async throws -> [RatingAction] {
        try await send(RatingActionsResponse.self, makeRequest(path: "/api/companies/\(companyId)/rating-actions")).ratingActions
    }

    func alerts() async throws -> [MarketAlert] {
        try await send(AlertsResponse.self, makeRequest(path: "/api/alerts")).alerts
    }

    func createAlert(_ body: AlertRequest) async throws -> MarketAlert {
        var request = makeRequest(path: "/api/alerts", method: "POST")
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONEncoder().encode(body)
        return try await send(AlertResponse.self, request).alert
    }

    func deleteAlert(id: String) async throws {
        _ = try await data(for: makeRequest(path: "/api/alerts/\(id)", method: "DELETE"))
    }

    private func makeRequest(path: String, method: String = "GET") -> URLRequest {
        var request = URLRequest(url: baseUrl.appendingPathComponent(path))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "accept")
        request.timeoutInterval = 15
        return request
    }

    private func send<T: Decodable>(_ type: T.Type, _ request: URLRequest) async throws -> T {
        let data = try await data(for: request)
        do {
            return try JSONDecoder().decode(type, from: data)
        } catch {
            throw ApiError(status: 200, code: "DECODE", message: "common.unexpected_response".localizedString, field: nil, correlationId: nil)
        }
    }

    private func data(for request: URLRequest) async throws -> Data {
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
                message: envelope?.error?.message ?? "common.request_failed".localizedFormat(status),
                field: envelope?.error?.field,
                correlationId: envelope?.error?.correlationId
            )
        }
        return data
    }
}
