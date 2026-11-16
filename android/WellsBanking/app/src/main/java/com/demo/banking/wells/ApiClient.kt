package com.demo.banking.wells

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

class ApiError(
    val status: Int,
    val code: String?,
    override val message: String,
    val field: String?,
    val correlationId: String?,
) : Exception(message) {
    val isServerError: Boolean get() = status >= 500 || status == 0

    companion object {
        val network = ApiError(0, "NETWORK", "Network error. Please try again.", null, null)
    }
}

@Serializable
private data class ErrorEnvelope(val error: Body? = null) {
    @Serializable
    data class Body(
        val code: String? = null,
        val message: String? = null,
        val field: String? = null,
        val correlationId: String? = null,
    )
}

class ApiClient(val baseUrl: String = BuildConfig.API_BASE_URL) {
    private val json = Json { ignoreUnknownKeys = true; explicitNulls = false }
    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    suspend fun indices(): List<MarketIndex> =
        send(get("/api/indices"), IndicesResponse.serializer()).indices

    suspend fun companies(): List<Company> =
        send(get("/api/companies"), CompaniesResponse.serializer()).companies

    suspend fun watchlists(): List<Watchlist> =
        send(get("/api/watchlists"), WatchlistsResponse.serializer()).watchlists

    suspend fun ratingActions(companyId: String): List<RatingAction> =
        send(get("/api/companies/$companyId/rating-actions"), RatingActionsResponse.serializer()).ratingActions

    suspend fun alerts(): List<Alert> =
        send(get("/api/alerts"), AlertsResponse.serializer()).alerts

    suspend fun createAlert(body: AlertRequest): Alert {
        val request = builder("/api/alerts")
            .post(json.encodeToString(AlertRequest.serializer(), body).toRequestBody(jsonType))
            .build()
        return send(request, AlertResponse.serializer()).alert
    }

    suspend fun deleteAlert(id: String) {
        execute(builder("/api/alerts/$id").delete().build())
    }

    private fun get(path: String): Request = builder(path).get().build()

    private fun builder(path: String): Request.Builder =
        Request.Builder().url(baseUrl.trimEnd('/') + path).header("accept", "application/json")

    private suspend fun <T> send(request: Request, serializer: kotlinx.serialization.KSerializer<T>): T {
        val text = execute(request)
        return try {
            json.decodeFromString(serializer, text)
        } catch (e: Exception) {
            throw ApiError(200, "DECODE", "Unexpected response from the server.", null, null)
        }
    }

    /** Runs the request and returns the response body, or throws [ApiError] for a non-2xx status. */
    private suspend fun execute(request: Request): String =
        withContext(Dispatchers.IO) {
            val response = try {
                client.newCall(request).execute()
            } catch (e: IOException) {
                throw ApiError.network
            }
            response.use { res ->
                val text = res.body?.string() ?: ""
                if (!res.isSuccessful) {
                    val envelope = runCatching { json.decodeFromString(ErrorEnvelope.serializer(), text) }.getOrNull()
                    throw ApiError(
                        status = res.code,
                        code = envelope?.error?.code,
                        message = envelope?.error?.message ?: "We couldn't complete your request. Please try again later.",
                        field = envelope?.error?.field,
                        correlationId = envelope?.error?.correlationId,
                    )
                }
                text
            }
        }

    private val jsonType = "application/json".toMediaType()

    companion object {
        val shared = ApiClient()
    }
}
