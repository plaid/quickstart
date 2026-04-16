package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.PaymentInitiationPaymentGetRequest;
import com.plaid.client.model.PaymentInitiationPaymentGetResponse;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

// This functionality is only relevant for the UK Payment Initiation product.
@Path("/payment")
@Produces(MediaType.APPLICATION_JSON)
public class PaymentInitiationResource {
  private final PlaidApi plaidClient;

  public PaymentInitiationResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public PaymentResponse getPayment() throws IOException {
    String paymentId = QuickstartApplication.paymentId;

    PaymentInitiationPaymentGetRequest request = new PaymentInitiationPaymentGetRequest()
      .paymentId(paymentId);

    PaymentInitiationPaymentGetResponse responseBody = PlaidApiHelper.callPlaid(
      plaidClient.paymentInitiationPaymentGet(request));
    return new PaymentResponse(responseBody);
  }

  private static class PaymentResponse {
    @JsonProperty
    private final PaymentInitiationPaymentGetResponse payment;

    public PaymentResponse(PaymentInitiationPaymentGetResponse response) {
      this.payment = response;
    }
  }
}
