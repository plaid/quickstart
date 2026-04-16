package com.plaid.quickstart.resources;

import com.plaid.client.model.AddressData;
import com.plaid.client.model.ClientUserIdentity;
import com.plaid.client.model.ClientUserIdentityAddress;
import com.plaid.client.model.ClientUserIdentityEmail;
import com.plaid.client.model.ClientUserIdentityName;
import com.plaid.client.model.ClientUserIdentityPhoneNumber;
import com.plaid.client.model.ConsumerReportUserIdentity;
import com.plaid.client.model.UserCreateRequest;
import com.plaid.client.model.UserCreateResponse;
import com.plaid.client.request.PlaidApi;
import com.plaid.quickstart.PlaidApiException;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Path("/create_user_token")
@Produces(MediaType.APPLICATION_JSON)
public class UserTokenResource {
  private final PlaidApi plaidClient;
  private final List<String> plaidProducts;

  public UserTokenResource(PlaidApi plaidClient, List<String> plaidProducts) {
    this.plaidClient = plaidClient;
    this.plaidProducts = plaidProducts;
  }

  // Create a user token which can be used for Plaid Check, Income, or Multi-Item link flows
  // https://plaid.com/docs/api/users/#usercreate
  @POST
  public UserCreateResponse createUserToken() throws IOException {
    String clientUserId = "user_" + UUID.randomUUID();

    UserCreateRequest userCreateRequest = new UserCreateRequest()
      // Typically, this will be a user ID number from your application.
      .clientUserId(clientUserId);

    if (plaidProducts.stream().anyMatch(product -> product.startsWith("cra_"))) {
      // Try with Identity field first (new-style)
      ClientUserIdentityName name = new ClientUserIdentityName()
        .givenName("Harry")
        .familyName("Potter");

      ClientUserIdentityPhoneNumber phoneNumber = new ClientUserIdentityPhoneNumber()
        .data("+16174567890")
        .primary(true);

      ClientUserIdentityEmail email = new ClientUserIdentityEmail()
        .data("harrypotter@example.com")
        .primary(true);

      ClientUserIdentityAddress address = new ClientUserIdentityAddress()
        .street1("4 Privet Drive")
        .city("New York")
        .region("NY")
        .postalCode("11111")
        .country("US")
        .primary(true);

      ClientUserIdentity identity = new ClientUserIdentity()
        .name(name)
        .dateOfBirth(LocalDate.parse("1980-07-31"))
        .phoneNumbers(Arrays.asList(phoneNumber))
        .emails(Arrays.asList(email))
        .addresses(Arrays.asList(address));

      userCreateRequest.identity(identity);
    }

    UserCreateResponse responseBody;
    try {
      responseBody = PlaidApiHelper.callPlaid(
        plaidClient.userCreate(userCreateRequest, null));
    } catch (PlaidApiException e) {
      // If the error is INVALID_FIELD for CRA products, retry with legacy identity format
      String errorMessage = e.getErrorResponse().toString();
      if (errorMessage.contains("INVALID_FIELD") &&
          plaidProducts.stream().anyMatch(product -> product.startsWith("cra_"))) {
        UserCreateRequest retryRequest = new UserCreateRequest()
          .clientUserId(clientUserId);

        AddressData addressData = new AddressData()
          .city("New York")
          .region("NY")
          .street("4 Privet Drive")
          .postalCode("11111")
          .country("US");

        retryRequest.consumerReportUserIdentity(new ConsumerReportUserIdentity()
          .dateOfBirth(LocalDate.parse("1980-07-31"))
          .firstName("Harry")
          .lastName("Potter")
          .phoneNumbers(Arrays.asList("+16174567890"))
          .emails(List.of("harrypotter@example.com"))
          .primaryAddress(addressData));

        responseBody = PlaidApiHelper.callPlaid(
          plaidClient.userCreate(retryRequest, null));
      } else {
        throw e;
      }
    }

    // Store both user_token and user_id
    if (responseBody.getUserToken() != null) {
      QuickstartApplication.userToken = responseBody.getUserToken();
    }
    if (responseBody.getUserId() != null) {
      QuickstartApplication.userId = responseBody.getUserId();
    }

    return responseBody;
  }
}