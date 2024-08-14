package com.plaid.quickstart;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.plaid.client.ApiClient;
import com.plaid.client.request.PlaidApi;
import com.plaid.quickstart.resources.AccessTokenResource;
import com.plaid.quickstart.resources.AccountsResource;
import com.plaid.quickstart.resources.AssetsResource;
import com.plaid.quickstart.resources.AuthResource;
import com.plaid.quickstart.resources.BalanceResource;
import com.plaid.quickstart.resources.CraResource;
import com.plaid.quickstart.resources.HoldingsResource;
import com.plaid.quickstart.resources.IdentityResource;
import com.plaid.quickstart.resources.InfoResource;
import com.plaid.quickstart.resources.InvestmentTransactionsResource;
import com.plaid.quickstart.resources.ItemResource;
import com.plaid.quickstart.resources.LinkTokenResource;
import com.plaid.quickstart.resources.LinkTokenWithPaymentResource;
import com.plaid.quickstart.resources.PaymentInitiationResource;
import com.plaid.quickstart.resources.PublicTokenResource;
import com.plaid.quickstart.resources.SignalResource;
import com.plaid.quickstart.resources.StatementsResource;
import com.plaid.quickstart.resources.TransactionsResource;
import com.plaid.quickstart.resources.TransferAuthorizeResource;
import com.plaid.quickstart.resources.TransferCreateResource;
import com.plaid.quickstart.resources.UserTokenResource;
import io.dropwizard.Application;
import io.dropwizard.configuration.EnvironmentVariableSubstitutor;
import io.dropwizard.configuration.SubstitutingSourceProvider;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class QuickstartApplication extends Application<QuickstartConfiguration> {
  // We store the accessToken in memory - in production, store it in a secure
  // persistent data store.
  public static String accessToken;
  public static String userToken;
  public static String itemID;
  // The paymentId is only relevant for the UK Payment Initiation product.
  // We store the paymentId in memory - in production, store it in a secure
  // persistent data store.
  public static String paymentId;
  // The authorizationId is only relevant for Transfer ACH product.
  // We store the transferId in memory - in production, store it in a secure
  // persistent data store.
  public static String authorizationId;
  public static String accountId;

  private PlaidApi plaidClient;
  private ApiClient apiClient;
  public String plaidEnv;

  public static void main(final String[] args) throws Exception {
    new QuickstartApplication().run(args);
  }

  @Override
  public String getName() {
    return "Quickstart";
  }

  @Override
  public void initialize(final Bootstrap<QuickstartConfiguration> bootstrap) {
    bootstrap.getObjectMapper().setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);
    bootstrap.setConfigurationSourceProvider(
      new SubstitutingSourceProvider(bootstrap.getConfigurationSourceProvider(),
        new EnvironmentVariableSubstitutor(false)
      )
    );
  }

  @Override
  public void run(final QuickstartConfiguration configuration,
    final Environment environment) {
    // or equivalent, depending on which environment you're calling into
    switch (configuration.getPlaidEnv()) {
      case "sandbox":
        plaidEnv = ApiClient.Sandbox;
        break;
      case "production":
        plaidEnv = ApiClient.Production;
        break;
      default:
        plaidEnv = ApiClient.Sandbox;
    }
    List<String> plaidProducts = Arrays.asList(configuration.getPlaidProducts().split(","));
    List<String> countryCodes = Arrays.asList(configuration.getPlaidCountryCodes().split(","));
    String plaidClientId = System.getenv("PLAID_CLIENT_ID");
    String plaidSecret = System.getenv("PLAID_SECRET");
    String redirectUri = null;
    if (configuration.getPlaidRedirectUri() != null && configuration.getPlaidRedirectUri().length() > 0) {
      redirectUri = configuration.getPlaidRedirectUri();
    }

    HashMap<String, String> apiKeys = new HashMap<String, String>();
    apiKeys.put("clientId", plaidClientId);
    apiKeys.put("secret", plaidSecret);
    apiKeys.put("plaidVersion", "2020-09-14");
    apiClient = new ApiClient(apiKeys);
    apiClient.setPlaidAdapter(plaidEnv);

    plaidClient = apiClient.createService(PlaidApi.class);

    environment.jersey().register(new AccessTokenResource(plaidClient, plaidProducts));
    environment.jersey().register(new AccountsResource(plaidClient));
    environment.jersey().register(new AssetsResource(plaidClient));
    environment.jersey().register(new AuthResource(plaidClient));
    environment.jersey().register(new BalanceResource(plaidClient));
    environment.jersey().register(new HoldingsResource(plaidClient));
    environment.jersey().register(new IdentityResource(plaidClient));
    environment.jersey().register(new InfoResource(plaidProducts));
    environment.jersey().register(new InvestmentTransactionsResource(plaidClient));
    environment.jersey().register(new ItemResource(plaidClient));
    environment.jersey().register(new LinkTokenResource(plaidClient, plaidProducts, countryCodes, redirectUri));
    environment.jersey().register(new LinkTokenWithPaymentResource(plaidClient, plaidProducts, countryCodes, redirectUri));
    environment.jersey().register(new PaymentInitiationResource(plaidClient));
    environment.jersey().register(new PublicTokenResource(plaidClient));
    environment.jersey().register(new SignalResource(plaidClient));
    environment.jersey().register(new StatementsResource(plaidClient));
    environment.jersey().register(new TransactionsResource(plaidClient));
    environment.jersey().register(new TransferAuthorizeResource(plaidClient));
    environment.jersey().register(new TransferCreateResource(plaidClient));
    environment.jersey().register(new UserTokenResource(plaidClient, plaidProducts));
    environment.jersey().register(new CraResource(plaidClient));
  }

  protected PlaidApi client() {
    return plaidClient;
  }

  protected ApiClient apiClient() {
    return apiClient;
  }

}
