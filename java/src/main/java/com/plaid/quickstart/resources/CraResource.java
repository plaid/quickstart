
package com.plaid.quickstart.resources;

import com.plaid.client.model.CraCheckReportBaseReportGetRequest;
import com.plaid.client.model.CraCheckReportBaseReportGetResponse;
import com.plaid.client.model.CraCheckReportIncomeInsightsGetRequest;
import com.plaid.client.model.CraCheckReportIncomeInsightsGetResponse;
import com.plaid.client.model.CraCheckReportPDFGetRequest;
import com.plaid.client.model.CraCheckReportPartnerInsightsGetRequest;
import com.plaid.client.model.CraCheckReportPartnerInsightsGetResponse;
import com.plaid.client.model.CraPDFAddOns;
import com.plaid.client.request.PlaidApi;
import com.plaid.quickstart.PlaidApiException;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import com.google.common.base.Throwables;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Response;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Produces(MediaType.APPLICATION_JSON)
@Path("/cra")
public class CraResource {
  private final PlaidApi plaidClient;

  public CraResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  // Retrieve CRA Base Report and PDF
  // Base report: https://plaid.com/docs/check/api/#cracheck_reportbase_reportget
  // PDF: https://plaid.com/docs/check/api/#cracheck_reportpdfget
  @GET
  @Path("/get_base_report")
  public Map getBaseReport() throws IOException {
    CraCheckReportBaseReportGetRequest request = new CraCheckReportBaseReportGetRequest();
    // Use user_token if available, otherwise use user_id
    if (QuickstartApplication.userToken != null) {
      request.setUserToken(QuickstartApplication.userToken);
    } else if (QuickstartApplication.userId != null) {
      request.setUserId(QuickstartApplication.userId);
    }
    CraCheckReportBaseReportGetResponse baseReportResponse = pollWithRetries(
      plaidClient.craCheckReportBaseReportGet(request));

    CraCheckReportPDFGetRequest pdfRequest = new CraCheckReportPDFGetRequest();
    // Use user_token if available, otherwise use user_id
    if (QuickstartApplication.userToken != null) {
      pdfRequest.setUserToken(QuickstartApplication.userToken);
    } else if (QuickstartApplication.userId != null) {
      pdfRequest.setUserId(QuickstartApplication.userId);
    }
    ResponseBody pdfResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.craCheckReportPdfGet(pdfRequest));

    String pdfBase64 = Base64.getEncoder().encodeToString(pdfResponseBody.bytes());

    Map<String, Object> responseMap = new HashMap<>();
    responseMap.put("report", baseReportResponse.getReport());
    responseMap.put("pdf", pdfBase64);
    return responseMap;
  }

  // Retrieve CRA Income Insights and PDF with Insights
  // Income insights:
  // https://plaid.com/docs/check/api/#cracheck_reportincome_insightsget
  // PDF w/ income insights:
  // https://plaid.com/docs/check/api/#cracheck_reportpdfget
  @GET
  @Path("/get_income_insights")
  public Map getIncomeInsigts() throws IOException {
    CraCheckReportIncomeInsightsGetRequest request = new CraCheckReportIncomeInsightsGetRequest();
    // Use user_token if available, otherwise use user_id
    if (QuickstartApplication.userToken != null) {
      request.setUserToken(QuickstartApplication.userToken);
    } else if (QuickstartApplication.userId != null) {
      request.setUserId(QuickstartApplication.userId);
    }
    CraCheckReportIncomeInsightsGetResponse incomeInsightsResponse = pollWithRetries(
      plaidClient.craCheckReportIncomeInsightsGet(request));

    CraCheckReportPDFGetRequest pdfRequest = new CraCheckReportPDFGetRequest();
    // Use user_token if available, otherwise use user_id
    if (QuickstartApplication.userToken != null) {
      pdfRequest.setUserToken(QuickstartApplication.userToken);
    } else if (QuickstartApplication.userId != null) {
      pdfRequest.setUserId(QuickstartApplication.userId);
    }
    pdfRequest.addAddOnsItem(CraPDFAddOns.INCOME_INSIGHTS);
    ResponseBody pdfResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.craCheckReportPdfGet(pdfRequest));

    String pdfBase64 = Base64.getEncoder().encodeToString(pdfResponseBody.bytes());

    Map<String, Object> responseMap = new HashMap<>();
    responseMap.put("report", incomeInsightsResponse.getReport());
    responseMap.put("pdf", pdfBase64);
    return responseMap;
  }

  // Retrieve CRA Partner Insights
  // https://plaid.com/docs/check/api/#cracheck_reportpartner_insightsget
  @GET
  @Path("/get_partner_insights")
  public CraCheckReportPartnerInsightsGetResponse getPartnerInsigts() throws IOException {
    CraCheckReportPartnerInsightsGetRequest request = new CraCheckReportPartnerInsightsGetRequest();
    // Use user_token if available, otherwise use user_id
    if (QuickstartApplication.userToken != null) {
      request.setUserToken(QuickstartApplication.userToken);
    } else if (QuickstartApplication.userId != null) {
      request.setUserId(QuickstartApplication.userId);
    }
    return pollWithRetries(plaidClient.craCheckReportPartnerInsightsGet(request));
  }

  // Since this quickstart does not support webhooks, this function can be used to
  // poll
  // an API that would otherwise be triggered by a webhook.
  // For a webhook example, see
  // https://github.com/plaid/tutorial-resources or
  // https://github.com/plaid/pattern
  private <T> T pollWithRetries(Call<T> requestCallback) throws IOException {
    for (int i = 0; i <= 20; i++) {
      // Clone the call for each retry since Retrofit calls can only be executed once
      Call<T> call = i == 0 ? requestCallback : requestCallback.clone();
      try {
        return PlaidApiHelper.callPlaid(call);
      } catch (PlaidApiException e) {
        Map<String, Object> error = (Map<String, Object>) e.getErrorResponse().get("error");
        if (error == null || !"PRODUCT_NOT_READY".equals(error.get("error_code"))) {
          throw e;
        }
        if (i == 20) {
          throw e;
        }
        try {
          Thread.sleep(1000);
        } catch (InterruptedException ie) {
          throw Throwables.propagate(ie);
        }
      }
    }
    throw Throwables.propagate(new Exception("Ran out of retries while polling"));
  }
}
