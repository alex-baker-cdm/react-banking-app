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

    suspend fun accounts(): List<Account> =
        send(get("/api/accounts"), AccountsResponse.serializer()).accounts

    suspend fun account(id: String): Account =
        send(get("/api/accounts/$id"), AccountResponse.serializer()).account

    suspend fun transactions(accountId: String): List<Transaction> =
        send(get("/api/accounts/$accountId/transactions"), TransactionsResponse.serializer()).transactions

    suspend fun transfer(body: TransferRequest): TransferReceipt {
        val request = builder("/api/transfers")
            .post(json.encodeToString(TransferRequest.serializer(), body).toRequestBody(jsonType))
            .build()
        return send(request, TransferResponse.serializer()).transfer
    }

    private fun get(path: String): Request = builder(path).get().build()

    private fun builder(path: String): Request.Builder =
        Request.Builder().url(baseUrl.trimEnd('/') + path).header("accept", "application/json")

    private suspend fun <T> send(request: Request, serializer: kotlinx.serialization.KSerializer<T>): T =
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
                        message = envelope?.error?.message ?: "Request failed with status ${res.code}",
                        field = envelope?.error?.field,
                        correlationId = envelope?.error?.correlationId,
                    )
                }
                try {
                    json.decodeFromString(serializer, text)
                } catch (e: Exception) {
                    throw ApiError(res.code, "DECODE", "Unexpected response from the server.", null, null)
                }
            }
        }

    private val jsonType = "application/json".toMediaType()

    companion object {
        val shared = ApiClient()
    }
}
