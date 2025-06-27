package com.plaid.quickstart.resources;

import com.plaid.client.model.AddressData;
import com.plaid.client.model.ConsumerReportUserIdentity;
import com.plaid.client.model.UserCreateRequest;
import com.plaid.client.model.UserCreateResponse;
import com.plaid.client.request.PlaidApi;
import com.plaid.quickstart.QuickstartApplication;
import retrofit2.Response;

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

    UserCreateRequest userCreateRequest = new UserCreateRequest()
      // Typically, this will be a user ID number from your application.
      .clientUserId("user_" + UUID.randomUUID());

    if (plaidProducts.stream().anyMatch(product -> product.startsWith("cra_"))) {
      AddressData addressData = new AddressData()
        .city("New York")
        .region("NY")
        .street("4 Privet Drive")
        .postalCode("11111")
        .country("US");
      userCreateRequest.consumerReportUserIdentity(new ConsumerReportUserIdentity()
        .dateOfBirth(LocalDate.parse("1980-07-31"))
        .firstName("Harry")
        .lastName("Potter")
        .phoneNumbers(Arrays.asList("+16174567890"))
        .emails(List.of("harrypotter@example.com"))
        .primaryAddress(addressData));
    }
    Response<UserCreateResponse> userResponse = plaidClient.userCreate(userCreateRequest).execute();

    // Ideally, we would store this somewhere more persistent
    QuickstartApplication.userToken = userResponse.body().getUserToken();
    return userResponse.body();
  }
}