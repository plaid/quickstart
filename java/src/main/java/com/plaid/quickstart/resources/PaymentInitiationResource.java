package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.paymentinitiation.PaymentCreateRequest;
import com.plaid.client.request.paymentinitiation.PaymentGetRequest;
import com.plaid.client.request.paymentinitiation.PaymentTokenCreateRequest;
import com.plaid.client.request.paymentinitiation.RecipientCreateRequest;
import com.plaid.client.response.ErrorResponse;
import com.plaid.client.response.paymentinitiation.PaymentCreateResponse;
import com.plaid.client.response.paymentinitiation.PaymentGetResponse;
import com.plaid.client.response.paymentinitiation.PaymentTokenCreateResponse;
import com.plaid.client.response.paymentinitiation.RecipientCreateResponse;
import com.plaid.client.model.paymentinitiation.Address;
import com.plaid.client.model.paymentinitiation.Amount;
import com.plaid.quickstart.QuickstartApplication;

import java.util.Arrays;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import retrofit2.Response;

// This functionality is only relevant for the UK Payment Initiation product.
@Path("/payment_initiation")
@Produces(MediaType.APPLICATION_JSON)
public class PaymentInitiationResource {
  private static final Logger LOG = LoggerFactory.getLogger(PaymentInitiationResource.class);

  private PlaidClient plaidClient;

  public PaymentInitiationResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public PaymentGetResponse getPayment() throws IOException {
    String paymentId = QuickstartApplication.paymentId;

    Response<PaymentGetResponse> paymentGetResponse =
      plaidClient.service().paymentGet(new PaymentGetRequest(paymentId)).execute();
    if (!paymentGetResponse.isSuccessful()) {
      try {
        ErrorResponse errorResponse = plaidClient.parseError(paymentGetResponse);
        LOG.error("error: " + errorResponse);
      } catch(Exception e) {
        LOG.error("error: " + e);
      }
    }

    return paymentGetResponse.body();
  }

  @POST
  public PaymentTokenResponse setPaymentToken() throws IOException {
    // Create recipient
    Address address = new Address(Arrays.asList("4 Privet Drive"), "Little Whinging", "11111", "GB");
    RecipientCreateRequest recipientCreateRequest =
      new RecipientCreateRequest("Harry Potter", "GB33BUKB20201555555555", address);
    Response<RecipientCreateResponse> recipientCreateResponse =
      plaidClient.service().recipientCreate(recipientCreateRequest).execute();
    if (!recipientCreateResponse.isSuccessful()) {
      try {
        ErrorResponse errorResponse = plaidClient.parseError(recipientCreateResponse);
        LOG.error("error: " + errorResponse);
      } catch(Exception e) {
        LOG.error("error: " + e);
      }
    }
    String recipientId = recipientCreateResponse.body().getRecipientId();
    LOG.info("Recipient ID: " + recipientId);

    // Create payment
    Amount amount = new Amount("GBP", 12.34);
    PaymentCreateRequest paymentCreateRequest = new PaymentCreateRequest(recipientId, "payment-ref", amount);
    Response<PaymentCreateResponse> paymentCreateResponse =
      plaidClient.service().paymentCreate(paymentCreateRequest).execute();
    if (!paymentCreateResponse.isSuccessful()) {
      try {
        ErrorResponse errorResponse = plaidClient.parseError(paymentCreateResponse);
        LOG.error("error: " + errorResponse);
      } catch(Exception e) {
        LOG.error("error: " + e);
      }
    }
    String paymentId = paymentCreateResponse.body().getPaymentId();
    QuickstartApplication.paymentId = paymentId;
    LOG.info("Payment ID: " + paymentId);

    // Create payment token
    Response<PaymentTokenCreateResponse> createPaymentTokenResponse =
      plaidClient.service().paymentTokenCreate(new PaymentTokenCreateRequest(QuickstartApplication.paymentId)).execute();
    if (!createPaymentTokenResponse.isSuccessful()) {
      try {
        ErrorResponse errorResponse = plaidClient.parseError(createPaymentTokenResponse);
        LOG.error("error: " + errorResponse);
      } catch(Exception e) {
        LOG.error("error: " + e);
      }
    }
    String paymentToken = createPaymentTokenResponse.body().getPaymentToken();
    QuickstartApplication.paymentToken = paymentToken;
    LOG.info("Payment Token: " + paymentToken);

    return new PaymentTokenResponse(QuickstartApplication.paymentToken);
  }

  public static class PaymentTokenResponse {
    @JsonProperty
    public String paymentToken;

    public PaymentTokenResponse(String paymentToken) {
      this.paymentToken = paymentToken;
    }
  }
}
