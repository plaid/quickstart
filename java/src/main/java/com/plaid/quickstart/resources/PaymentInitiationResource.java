package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.gson.Gson;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.PaymentInitiationPaymentGetRequest;
import com.plaid.client.model.PaymentInitiationPaymentGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import retrofit2.Response;

// This functionality is only relevant for the UK Payment Initiation product.
@Path("/payment")
@Produces(MediaType.APPLICATION_JSON)
public class PaymentInitiationResource {
  private static final Logger LOG = LoggerFactory.getLogger(PaymentInitiationResource.class);

  private final PlaidApi plaidClient;

  public PaymentInitiationResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public PaymentResponse getPayment() throws IOException {
    String paymentId = QuickstartApplication.paymentId;

    PaymentInitiationPaymentGetRequest request = new PaymentInitiationPaymentGetRequest()
      .paymentId(paymentId);

    Response<PaymentInitiationPaymentGetResponse> response =
      plaidClient
      .paymentInitiationPaymentGet(request)
      .execute();
    if (!response.isSuccessful()) {
      try {
        Gson gson = new Gson();
        Error errorResponse = gson.fromJson(response.errorBody().string(), Error.class);
        LOG.error("error: " + errorResponse);
      } catch (Exception e) {
          LOG.error("error", e);
      }
    }
    return new PaymentResponse(response.body());
  }

  private static class PaymentResponse {
    @JsonProperty
    private final PaymentInitiationPaymentGetResponse payment;

    public PaymentResponse(PaymentInitiationPaymentGetResponse response) {
      this.payment = response;
    }
  }
}
