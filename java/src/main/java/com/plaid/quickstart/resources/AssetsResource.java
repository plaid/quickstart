package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AssetReportCreateRequest;
import com.plaid.client.model.AssetReportCreateResponse;
import com.plaid.client.model.AssetReportGetRequest;
import com.plaid.client.model.AssetReportGetResponse;
import com.plaid.client.model.AssetReportPDFGetRequest;
import com.plaid.quickstart.QuickstartApplication;
import com.plaid.client.model.PlaidError;
import com.plaid.client.model.PlaidErrorType;
import okhttp3.ResponseBody;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;
import com.google.gson.Gson;
import jersey.repackaged.com.google.common.base.Throwables;

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

    Response<AssetReportCreateResponse> assetReportCreateResponse = plaidClient
      .assetReportCreate(assetReportCreateRequest)
      .execute();

    String assetReportToken = assetReportCreateResponse.body().getAssetReportToken();
    AssetReportGetRequest assetReportGetRequest = new AssetReportGetRequest()
      .assetReportToken(assetReportToken);
    Response<AssetReportGetResponse> assetReportGetResponse = null;
    
    //In a real integration, we would wait for a webhook rather than polling like this
    for (int i = 0; i < 5; i++){
      assetReportGetResponse = plaidClient.assetReportGet(assetReportGetRequest).execute();
      if (assetReportGetResponse.isSuccessful()){
        break;
      } else {
        try {
          Gson gson = new Gson();
          PlaidError error = gson.fromJson(assetReportGetResponse.errorBody().string(), PlaidError.class);
          error.getErrorType().equals(PlaidErrorType.ASSET_REPORT_ERROR);
          error.getErrorCode().equals("PRODUCT_NOT_READY");
          Thread.sleep(5000);
        } catch (Exception e) {
          throw Throwables.propagate(e);
        }
      }
    }

    AssetReportPDFGetRequest assetReportPDFGetRequest = new AssetReportPDFGetRequest()
      .assetReportToken(assetReportToken);

    Response<ResponseBody> assetReportPDFGetResponse = plaidClient
      .assetReportPdfGet(assetReportPDFGetRequest)
      .execute();

    String pdf = Base64.getEncoder().encodeToString(assetReportPDFGetResponse.body().bytes());
    Map<String, Object> responseMap = new HashMap<>();
    responseMap.put("json", assetReportGetResponse.body().getReport());
    responseMap.put("pdf", pdf);
    return responseMap;

  }
}
