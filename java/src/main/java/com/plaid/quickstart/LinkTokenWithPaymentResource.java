package com.plaid.quickstart;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.PlaidClient;
import com.plaid.client.model.paymentinitiation.Address;
import com.plaid.client.model.paymentinitiation.Amount;
import com.plaid.client.request.LinkTokenCreateRequest;
import com.plaid.client.request.paymentinitiation.PaymentCreateRequest;
import com.plaid.client.request.paymentinitiation.RecipientCreateRequest;
import com.plaid.client.response.LinkTokenCreateResponse;
import com.plaid.client.response.paymentinitiation.PaymentCreateResponse;
import com.plaid.client.response.paymentinitiation.RecipientCreateResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import retrofit2.Response;

@Path("/create_link_token_for_payment")
@Produces(MediaType.APPLICATION_JSON)
public class LinkTokenWithPaymentResource {
  private PlaidClient plaidClient;
  private List<String> plaidProducts;
  private List<String> countryCodes;

  public LinkTokenWithPaymentResource(PlaidClient plaidClient, List<String> plaidProducts,
    List<String> countryCodes) {
    this.plaidClient = plaidClient;
    this.plaidProducts = plaidProducts;
    this.countryCodes = countryCodes;
  }

  public static class LinkToken {
    @JsonProperty
    private String link_token;

    public LinkToken(String linkToken) {
      this.link_token = linkToken;
    }
  }

  @POST public LinkToken getLinkToken() throws IOException {
    Response<RecipientCreateResponse> recipientResponse =
      plaidClient.service().recipientCreate(new RecipientCreateRequest(
        "Harry Potter",
        "GB33BUKB20201555555555",
        new Address(Arrays.asList("4 Privet Drive"),
          "Little Whinging",
          "11111",
          "GB"))).execute();

    Response<PaymentCreateResponse> paymentCreateResponse =
      plaidClient.service().paymentCreate(new PaymentCreateRequest(
        recipientResponse.body().getRecipientId(),
        "payment-ref",
        new Amount("GBP", 12.34)
      )).execute();
    String paymentId = paymentCreateResponse.body().getPaymentId();
    LinkTokenCreateRequest request = new LinkTokenCreateRequest(
      new LinkTokenCreateRequest.User("user-id"),
      "my client name",
      plaidProducts,
      this.countryCodes,
      "en"
    ).withPaymentInitiation(new LinkTokenCreateRequest.PaymentInitiation(
      paymentId
    ));
    QuickstartApplication.paymentId = paymentId;
    Response<LinkTokenCreateResponse> response = plaidClient.service().linkTokenCreate(request)
      .execute();
    return new LinkToken(response.body().getLinkToken());
  }
}
