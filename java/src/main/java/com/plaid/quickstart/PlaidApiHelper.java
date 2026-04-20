package com.plaid.quickstart;

import com.fasterxml.jackson.databind.ObjectMapper;
import retrofit2.Call;
import retrofit2.Response;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class PlaidApiHelper {
    private static final ObjectMapper mapper = new ObjectMapper();

    @SuppressWarnings("unchecked")
    public static <T> T callPlaid(Call<T> call) throws IOException {
        Response<T> response = call.execute();
        if (!response.isSuccessful()) {
            Map<String, Object> error = new HashMap<>();
            error.put("status_code", response.code());
            try {
                String errorBody = response.errorBody().string();
                Map<String, Object> body = mapper.readValue(errorBody, Map.class);
                error.put("error_code", body.getOrDefault("error_code", "UNKNOWN"));
                error.put("error_type", body.getOrDefault("error_type", "API_ERROR"));
                error.put("error_message", body.getOrDefault("error_message", errorBody));
                error.put("display_message", body.get("display_message"));
            } catch (Exception e) {
                error.put("error_code", "UNKNOWN");
                error.put("error_type", "API_ERROR");
                error.put("error_message", "Unknown error (HTTP " + response.code() + ")");
            }
            Map<String, Object> result = new HashMap<>();
            result.put("error", error);
            throw new PlaidApiException(result, response.code());
        }
        return response.body();
    }
}
