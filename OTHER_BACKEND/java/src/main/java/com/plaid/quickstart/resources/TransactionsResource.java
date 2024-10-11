package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.TransactionsSyncRequest;
import com.plaid.client.model.TransactionsSyncResponse;
import com.plaid.client.model.Transaction;
import com.plaid.client.model.RemovedTransaction;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionsResource {
  private final PlaidApi plaidClient;


  public TransactionsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransactionsResponse getTransactions() throws IOException, InterruptedException {
    // Set cursor to empty to receive all historical updates
    String cursor = null;

    // New transaction updates since "cursor"
    List<Transaction> added = new ArrayList<Transaction>();
    List<Transaction> modified = new ArrayList<Transaction>();
    List<RemovedTransaction> removed = new ArrayList<RemovedTransaction>();
    boolean hasMore = true;
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      TransactionsSyncRequest request = new TransactionsSyncRequest()
        .accessToken(QuickstartApplication.accessToken)
        .cursor(cursor);

      Response<TransactionsSyncResponse> response = plaidClient.transactionsSync(request).execute();
      TransactionsSyncResponse responseBody = response.body();

      cursor = responseBody.getNextCursor();

      // If no transactions are available yet, wait and poll the endpoint.
      // Normally, we would listen for a webhook, but the Quickstart doesn't
      // support webhooks. For a webhook example, see
      // https://github.com/plaid/tutorial-resources or
      // https://github.com/plaid/pattern

      if (cursor.equals("")) {
          Thread.sleep(2000); 
          continue; 
      }
      // Add this page of results
      added.addAll(responseBody.getAdded());
      modified.addAll(responseBody.getModified());
      removed.addAll(responseBody.getRemoved());
      hasMore = responseBody.getHasMore();
    }

    // Return the 8 most recent transactions
    added.sort(new TransactionsResource.CompareTransactionDate());
    List<Transaction> latestTransactions = added.subList(Math.max(added.size() - 8, 0), added.size());
    return new TransactionsResponse(latestTransactions);
  }

  private class CompareTransactionDate implements Comparator<Transaction> {
    @Override
    public int compare(Transaction o1, Transaction o2) {
        return o1.getDate().compareTo(o2.getDate());
    }
  }
  
  private static class TransactionsResponse {
    @JsonProperty
    private final List<Transaction> latest_transactions;
  
    public TransactionsResponse(List<Transaction> latestTransactions) {
      this.latest_transactions = latestTransactions;
    }
  }
}
