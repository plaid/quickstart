package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AssetReportCreateRequest;
import com.plaid.client.model.AssetReportCreateResponse;
import com.plaid.client.model.AssetReportGetRequest;
import com.plaid.client.model.AssetReportGetResponse;
import com.plaid.client.model.AssetReportPDFGetRequest;
import com.plaid.quickstart.PlaidApiException;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;
import okhttp3.ResponseBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/assets")
@Produces(MediaType.APPLICATION_JSON)
public class AssetsResource {
  private final PlaidApi plaidClient;

  public AssetsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public Map getAssetReport() throws IOException {
    ArrayList<String> accessTokens = new ArrayList<>();
    accessTokens.add(QuickstartApplication.accessToken);

    AssetReportCreateRequest assetReportCreateRequest = new AssetReportCreateRequest()
      .accessTokens(accessTokens)
      .daysRequested(10);

    AssetReportCreateResponse assetReportCreateResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.assetReportCreate(assetReportCreateRequest));

    String assetReportToken = assetReportCreateResponseBody.getAssetReportToken();
    AssetReportGetRequest assetReportGetRequest = new AssetReportGetRequest()
      .assetReportToken(assetReportToken);

    // In a real integration, we would wait for a webhook rather than polling like this
    AssetReportGetResponse assetReportGetResponseBody = null;
    for (int i = 0; i <= 20; i++) {
      try {
        assetReportGetResponseBody = PlaidApiHelper.callPlaid(
          plaidClient.assetReportGet(assetReportGetRequest));
        break;
      } catch (PlaidApiException e) {
        @SuppressWarnings("unchecked")
        Map<String, Object> error = (Map<String, Object>) e.getErrorResponse().get("error");
        boolean isProductNotReady = error != null && "PRODUCT_NOT_READY".equals(error.get("error_code"));
        boolean isServerError = error != null && error.get("status_code") instanceof Integer && (Integer) error.get("status_code") >= 500;
        if (!isProductNotReady && !isServerError) {
          throw e;
        }
        if (i == 20) {
          throw e;
        }
        try {
          Thread.sleep(1000);
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
          throw new IOException("Interrupted while polling for asset report", ie);
        }
      }
    }

    AssetReportPDFGetRequest assetReportPDFGetRequest = new AssetReportPDFGetRequest()
      .assetReportToken(assetReportToken);

    ResponseBody assetReportPDFGetResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.assetReportPdfGet(assetReportPDFGetRequest));

    String pdf = Base64.getEncoder().encodeToString(assetReportPDFGetResponseBody.bytes());
    Map<String, Object> responseMap = new HashMap<>();
    responseMap.put("json", assetReportGetResponseBody.getReport());
    responseMap.put("pdf", pdf);
    return responseMap;

  }
}
