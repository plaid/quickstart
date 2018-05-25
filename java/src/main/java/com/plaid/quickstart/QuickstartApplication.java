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
import com.plaid.quickstart.resources.PublicTokenResource;
import com.plaid.quickstart.resources.TransactionsResource;

public class QuickstartApplication extends Application<QuickstartConfiguration> {

  private PlaidClient plaidClient;
  public static String accessToken;

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
                       new EnvironmentVariableSubstitutor()
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

    final AccessTokenResource accessTokenResource = new AccessTokenResource(plaidClient);
    environment.jersey().register(accessTokenResource);
    final AccountsResource accountsResource = new AccountsResource(plaidClient);
    environment.jersey().register(accountsResource);
    final IndexResource indexResource = new IndexResource("sandbox", configuration.getPlaidPublicKey());
    environment.jersey().register(indexResource);
    final ItemResource itemResource = new ItemResource(plaidClient);
    environment.jersey().register(itemResource);
    final PublicTokenResource publicTokenResource = new PublicTokenResource(plaidClient);
    environment.jersey().register(publicTokenResource);
    final TransactionsResource transactionsResource = new TransactionsResource(plaidClient);
    environment.jersey().register(transactionsResource);
  }
}
