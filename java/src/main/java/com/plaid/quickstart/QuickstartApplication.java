package com.plaid.quickstart;

import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.configuration.EnvironmentVariableSubstitutor;
import io.dropwizard.configuration.SubstitutingSourceProvider;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;

import com.plaid.client.PlaidClient;
import com.plaid.quickstart.resources.AccessTokenResource;
import com.plaid.quickstart.resources.AccountsResource;
import com.plaid.quickstart.resources.IndexResource;
import com.plaid.quickstart.resources.ItemResource;
import com.plaid.quickstart.resources.OAuthResource;
import com.plaid.quickstart.resources.PaymentInitiationResource;
import com.plaid.quickstart.resources.PublicTokenResource;
import com.plaid.quickstart.resources.TransactionsResource;

public class QuickstartApplication extends Application<QuickstartConfiguration> {
  private PlaidClient plaidClient;
  // We store the accessToken in memory - in production, store it in a secure
  // persistent data store.
  public static String accessToken;
  // The payment_token is only relevant for the UK Payment Initiation product.
  // We store the paymentToken in memory - in production, store it in a secure
  // persistent data store.
  public static String paymentToken;
  public static String paymentId;

  public static void main(final String[] args) throws Exception {
    new QuickstartApplication().run(args);
  }

  @Override
  public String getName() {
    return "Quickstart";
  }

  @Override
  public void initialize(final Bootstrap<QuickstartConfiguration> bootstrap) {
    bootstrap.setConfigurationSourceProvider(
      new SubstitutingSourceProvider(bootstrap.getConfigurationSourceProvider(),
                       new EnvironmentVariableSubstitutor(false)
      )
    );
    bootstrap.addBundle(new AssetsBundle("/static", "/static"));
    bootstrap.addBundle(new ViewBundle<QuickstartConfiguration>());
  }

  @Override
  public void run(final QuickstartConfiguration configuration,
          final Environment environment) {
    plaidClient = PlaidClient.newBuilder()
      .clientIdAndSecret(configuration.getPlaidClientID(), configuration.getPlaidSecret())
      .publicKey(configuration.getPlaidPublicKey()) // optional. only needed to call endpoints that require a public key
      .sandboxBaseUrl() // or equivalent, depending on which environment you're calling into
      .build();

    environment.jersey().register(new AccessTokenResource(plaidClient));
    environment.jersey().register(new AccountsResource(plaidClient));
    environment.jersey().register(new IndexResource(
      "sandbox",
      configuration.getPlaidPublicKey(),
      configuration.getPlaidProducts(),
      configuration.getPlaidCountryCodes(),
      configuration.getPlaidOAuthRedirectUri(),
      configuration.getPlaidOAuthNonce()
    ));
    environment.jersey().register(new OAuthResource(
      "sandbox",
      configuration.getPlaidPublicKey(),
      configuration.getPlaidProducts(),
      configuration.getPlaidCountryCodes(),
      configuration.getPlaidOAuthNonce()
    ));
    environment.jersey().register(new ItemResource(plaidClient));
    environment.jersey().register(new PublicTokenResource(plaidClient));
    environment.jersey().register(new TransactionsResource(plaidClient));
    environment.jersey().register(new PaymentInitiationResource(plaidClient));
  }
}
