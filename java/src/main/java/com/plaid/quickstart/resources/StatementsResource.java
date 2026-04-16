package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.StatementsListRequest;
import com.plaid.client.model.StatementsListResponse;
import com.plaid.client.model.StatementsDownloadRequest;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;
import okhttp3.ResponseBody;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/statements")
@Produces(MediaType.APPLICATION_JSON)
public class StatementsResource {
  private final PlaidApi plaidClient;

  public StatementsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public Map statementsList() throws IOException {

    StatementsListRequest statementsListRequest = new StatementsListRequest()
      .accessToken(QuickstartApplication.accessToken);

    StatementsListResponse statementsListResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.statementsList(statementsListRequest));

    StatementsDownloadRequest statementsDownloadRequest = new StatementsDownloadRequest()
      .accessToken(QuickstartApplication.accessToken)
      .statementId(statementsListResponseBody.getAccounts().get(0).getStatements().get(0).getStatementId());

    ResponseBody statementsDownloadResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.statementsDownload(statementsDownloadRequest));

    String pdf = Base64.getEncoder().encodeToString(statementsDownloadResponseBody.bytes());

    Map<String, Object> responseMap = new HashMap<>();
    responseMap.put("json", statementsListResponseBody);
    responseMap.put("pdf", pdf);

    return responseMap;

  }
}
