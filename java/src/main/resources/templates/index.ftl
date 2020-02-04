<#-- @ftlvariable name="" type="com.plaid.quickstart.resources.IndexResource.IndexView" -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Plaid Walkthrough Example</title>
  <link rel="stylesheet" type="text/css" href="static/style.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="banner">
    <h1>Plaid Example Walkthrough</h1>
    <p id="intro">
      This is an example application that walks through integrating Plaid Link using the API to retrieve data for some of our products.
    </p>
    <p id="steps">
      Great - you just created an Item! The server was successfully able to exchange the public_token for an access_token.
      Below are a few options - you can get account data, retrieve information about the Item itself, or pull transaction data.
    </p>
  </div>

  <div id="container">
    <p>
      Click the button below to open a list of Institutions - after you select one,
      you'll be guided through an authentication process. The public_token will be passed
      back to the example server, which will then exchange it for an access_token and log it
      to your console.
    </p>

    <button id="link-btn" disabled>Open Link</button>
    <div class="loading-indicator"></div>
  </div>

  <div id="app">
    <div class="box">
      <button id="get-accounts-btn">Get Accounts</button>
      <div id="get-accounts-data"></div>
    </div>

    <div class="box">
      <button id="get-item-btn">Get Item</button>
      <div id="get-item-data"></div>
    </div>

    <div class="box">
      <button id="get-transactions-btn">Get Transactions</button>
      <div id="get-transactions-data"></div>
    </div>

    <!-- This functionality is only relevant for the UK Payment Initiation product. -->
    <div class="box payment_initiation" style='display:none;'>
      <button id="get-payment-btn">Get Payment</button>
      <div id="get-payment-data"></div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
  <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
  <script>
  (function($) {
    // Handles redirect from the oauth response page for the oauth flow.
    if (document.referrer != null && document.referrer.includes('http://localhost:8080/oauth-response.html')) {
      $('#container').fadeOut('fast', function() {
        $('#intro').hide();
        $('#app, #steps').fadeIn('slow');
      });
    }

    var products = '${plaidProducts}'.split(',');
    let handler = null;

    var linkHandlerCommonOptions = {
      apiVersion: 'v2',
      clientName: 'Plaid Quickstart',
      env: '${plaidEnvironment}',
      product: products,
      key: '${plaidPublicKey}',
      countryCodes: '${plaidCountryCodes}'.split(','),
    };
    var oauthRedirectUri = '${plaidOAuthRedirectUri}';
    if (oauthRedirectUri != '') {
      linkHandlerCommonOptions.oauthRedirectUri = oauthRedirectUri;
    }
    var oauthNonce = '${plaidOAuthNonce}';
    if (oauthNonce != '') {
      linkHandlerCommonOptions.oauthNonce = oauthNonce;
    }
    // This functionality is only relevant for the UK Payment Initiation product.
    if (products.includes('payment_initiation')) {
      $('.payment_initiation').show();
      $.post('/payment_initiation', {}, function(data) {
        var paymentToken = data.paymentToken;

        // In the case of payment_initiation product, we need to wait for
        // payment token to be generated before the Link handler can be
        // initialized.
        handler = Plaid.create({
          ...linkHandlerCommonOptions,
          paymentToken: paymentToken,
          language: 'en',
          onSuccess: function(public_token) {
            // This public token exchange step is not relevant for the
            // payment_initiation product and should be skipped.
            $.post('/get_access_token', {public_token: public_token}, function() {
              $('#container').fadeOut('fast', function() {
                $('#intro').hide();
                $('#app, #steps').fadeIn('slow');
              });
            });
          },
        });
        $('#link-btn').attr('disabled', false);
        $('.loading-indicator').hide();
      });
    } else {
      handler = Plaid.create({
        ...linkHandlerCommonOptions,
        // webhook: 'https://your-domain.tld/plaid-webhook',
        onSuccess: function(public_token) {
          $.post('/get_access_token', {public_token: public_token}, function() {
            $('#container').fadeOut('fast', function() {
              $('#intro').hide();
              $('#app, #steps').fadeIn('slow');
            });
          });
        },
      });
      $('#link-btn').attr('disabled', false);
      $('.loading-indicator').hide();
    }

    $('#link-btn').on('click', function(e) {
      handler.open();
    });

    $('#get-accounts-btn').on('click', function(e) {
      $.get('/accounts', function(data) {
        $('#get-accounts-data').slideUp(function() {
          var html = '';
          data.accounts.forEach(function(account, idx) {
            html += '<div class="inner">';
            html += '<strong>' + account.name +
                ' $' + (account.balances.available != null ? account.balances.available : account.balances.current) + '</strong><br>';
            html += account.subtype + ' ' + account.mask;
            html += '</div>';
          });

          $(this).html(html).slideDown();
        });
      });
    });

    $('#get-item-btn').on('click', function(e) {
      $.post('/item', function(data) {
        $('#get-item-data').slideUp(function() {
          if(data.error)
            $(this).html('<p>' + data.error + '</p>').slideDown();
          else {
            var html = '<div class="inner">';
            html += '<p>Here\'s some basic information about your Item:</p>';
            html += '<p>Institution name:' + data.institution.name +'</p>';
            html += '<p>Billed products: ' + data.item.billedProducts.join(', ') + '</p>';
            html += '<p>Available products: ' + data.item.availableProducts.join(', ') + '</p>';
            html += '</div>';

            $(this).html(html).slideDown();
          }
        });
      });
    });

  $('#get-transactions-btn').on('click', function(e) {
    $.post('/transactions', function(data) {
      console.log(data);
    if (data.error != null && data.error.error_code != null) {
      // Format the error
      var errorHtml = '<div class="inner"><p>' +
       '<strong>' + data.error.error_code + ':</strong> ' +
       data.error.error_message + '</p></div>';

      if (data.error.error_code === 'PRODUCT_NOT_READY') {
      // Add additional context for `PRODUCT_NOT_READY` errors
      errorHtml += '<div class="inner"><p>The PRODUCT_NOT_READY ' +
       'error is returned when a request to retrieve Transaction data ' +
       'is made before Plaid finishes the <a href="https://plaid.com/' +
       'docs/quickstart/#transaction-data-with-webhooks">initial ' +
       'transaction pull.</a></p></div>';
      }
      // Render the error
      $('#get-transactions-data').slideUp(function() {
        $(this).slideUp(function() {
          $(this).html(errorHtml).slideDown();
        });
      });
    } else {
      $('#get-transactions-data').slideUp(function() {
      var html = '';
      data.transactions.forEach(function(txn, idx) {
        html += '<div class="inner">';
        html += '<strong>' + txn.name + '</strong><br>';
        html += '$' + txn.amount;
        html += '<br><em>' + txn.date + '</em>';
        html += '</div>';
      });

      $(this).slideUp(function() {
        $(this).html(html).slideDown();
      });
      });
    }
    });
  });

  // This functionality is only relevant for the UK Payment Initiation product.
  $('#get-payment-btn').on('click', function(e) {
    $.get('/payment_initiation', function(data) {

      $('#get-payment-data').slideUp(function() {
        if(data.error)
          $(this).html('<p>' + data.error + '</p>').slideDown();
        else {
          var html = '<div class="inner">';
          html += '<p>Here\'s some basic information about your Payment:</p>';
          html += '<p>Payment ID:' + data.paymentId +'</p>';
          html += '<p>Amount: ' + (data.amount.currency + ' ' + data.amount.value) + '</p>';
          html += '<p>Status: ' + data.status + '</p>';
          html += '<p>Last Status Update: ' + data.lastStatusUpdate + '</p>';
          html += '<p>Recipient ID: ' + data.recipientId + '</p>';
          html += '</div>';

          $(this).html(html).slideDown();
        }
      });
    });
  });

  })(jQuery);
  </script>
</body>
</html>
