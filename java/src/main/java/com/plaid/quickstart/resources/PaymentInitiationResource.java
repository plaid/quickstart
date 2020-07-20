package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.paymentinitiation.PaymentGetRequest;
import com.plaid.client.response.ErrorResponse;
import com.plaid.client.response.paymentinitiation.PaymentGetResponse;
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

  private final PlaidClient plaidClient;

  public PaymentInitiationResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public PaymentResponse getPayment() throws IOException {
    String paymentId = QuickstartApplication.paymentId;

    Response<PaymentGetResponse> paymentGetResponse =
      plaidClient.service().paymentGet(new PaymentGetRequest(paymentId)).execute();
    if (!paymentGetResponse.isSuccessful()) {
      try {
        ErrorResponse errorResponse = plaidClient.parseError(paymentGetResponse);
        LOG.error("error: " + errorResponse);
      } catch (Exception e) {
        LOG.error("error", e);
      }
    }

    return new PaymentResponse(paymentGetResponse.body());
  }

  private static class PaymentResponse {
    @JsonProperty
    private final PaymentGetResponse payment;

    public PaymentResponse(PaymentGetResponse response) {
      this.payment = response;
    }
  }
}
