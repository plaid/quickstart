import React, { useContext } from "react";
import { Callout } from "plaid-threads/Callout";
import { Button } from "plaid-threads/Button";
import { InlineLink } from "plaid-threads/InlineLink";

import Link from "../Link";
import Context from "../../Context";

import styles from "./index.module.scss";

const Header = () => {
  const {
    itemId,
    accessToken,
    userToken,
    userId,
    linkToken,
    linkSuccess,
    isItemAccess,
    backend,
    linkTokenError,
    linkExitError,
    isPaymentInitiation,
  } = useContext(Context);

  return (
    <div className={styles.grid}>
      <h3 className={styles.title}>Plaid Quickstart</h3>

      {!linkSuccess ? (
        <>
          <h4 className={styles.subtitle}>
            A sample end-to-end integration with Plaid
          </h4>
          <p className={styles.introPar}>
            The Plaid flow begins when your user wants to connect their bank
            account to your app. Simulate this by clicking the button below to
            launch Link - the client-side component that your users will
            interact with in order to link their accounts to Plaid and allow you
            to access their accounts via the Plaid API.
          </p>
          {/* message if backend is not running and there is no link token */}
          {!backend ? (
            <Callout warning>
              Unable to fetch link_token: please make sure your backend server
              is running and that your .env file has been configured with your
              <code>PLAID_CLIENT_ID</code> and <code>PLAID_SECRET</code>.
            </Callout>
          ) : /* message if backend is running and there is no link token */
          linkToken == null && backend ? (
            <Callout warning>
              <div>
                Unable to fetch link_token: please make sure your backend server
                is running and that your .env file has been configured
                correctly.
              </div>
              <div>
                If you are on a Windows machine, please ensure that you have
                cloned the repo with{" "}
                <InlineLink
                  href="https://github.com/plaid/quickstart#special-instructions-for-windows"
                  target="_blank"
                >
                  symlinks turned on.
                </InlineLink>{" "}
                You can also try checking your{" "}
                <InlineLink
                  href="https://dashboard.plaid.com/activity/logs"
                  target="_blank"
                >
                  activity log
                </InlineLink>{" "}
                on your Plaid dashboard.
              </div>
              <div>
                Error Code: <code>{linkTokenError.error_code}</code>
              </div>
              <div>
                Error Type: <code>{linkTokenError.error_type}</code>{" "}
              </div>
              <div>Error Message: {linkTokenError.error_message}</div>
              {linkTokenError.error_code === "INVALID_LINK_CUSTOMIZATION" && (
                <div>
                  <strong>Tip:</strong> In the{" "}
                  <InlineLink
                    href="https://dashboard.plaid.com/link/data-transparency-v5"
                    target="_blank"
                  >
                    dashboard under Link &gt; Link Customization Data
                    Transparency Messaging
                  </InlineLink>
                  , ensure at least one use case is selected. After selecting a
                  use case, make sure to click <strong>Publish Changes</strong>.
                </div>
              )}
            </Callout>
          ) : linkToken === "" ? (
            <div className={styles.linkButton}>
              <Button large disabled>
                Loading...
              </Button>
            </div>
          ) : (
            <div className={styles.linkButton}>
              <Link />
            </div>
          )}
          {linkExitError != null && (
            <Callout warning>
              <div>
                Link exited with an error.
              </div>
              <div>
                Error Code: <code>{linkExitError.error_code}</code>
              </div>
              <div>
                Error Type: <code>{linkExitError.error_type}</code>
              </div>
              <div>Error Message: {linkExitError.error_message}</div>
              {linkExitError.display_message && (
                <div>Details: {linkExitError.display_message}</div>
              )}
              {linkExitError.error_code === "INVALID_LINK_CUSTOMIZATION" && (
                <div>
                  <strong>Tip:</strong> In the{" "}
                  <InlineLink
                    href="https://dashboard.plaid.com/link/data-transparency-v5"
                    target="_blank"
                  >
                    dashboard under Link &gt; Link Customization Data
                    Transparency Messaging
                  </InlineLink>
                  , ensure at least one use case is selected. After selecting a
                  use case, make sure to click <strong>Publish Changes</strong>.
                </div>
              )}
              {linkExitError.error_code ===
                "INSTITUTION_REGISTRATION_REQUIRED" &&
                (["PNC", "Charles Schwab"].some((name) =>
                  linkExitError.institution_name
                    ?.toLowerCase()
                    .includes(name.toLowerCase())
                ) ? (
                  <div>
                    {linkExitError.institution_name} requires a special
                    registration process to access Production data. See{" "}
                    <InlineLink
                      href="https://dashboard.plaid.com/activity/status/oauth-institutions"
                      target="_blank"
                    >
                      OAuth institution status
                    </InlineLink>{" "}
                    for details.
                  </div>
                ) : (
                  <div>
                    Certain OAuth institutions, including Bank of America,
                    Chase, Capital One, and American Express, may take up to 24
                    hours to become available after obtaining Production access.
                  </div>
                ))}
            </Callout>
          )}
        </>
      ) : (
        <>
          {isPaymentInitiation ? (
            <>
              <h4 className={styles.subtitle}>
                Congrats! Your payment is now confirmed.
                <p />
                <Callout>
                  You can see information of all your payments in the{" "}
                  <InlineLink
                    href="https://dashboard.plaid.com/activity/payments"
                    target="_blank"
                  >
                    Payments Dashboard
                  </InlineLink>
                  .
                </Callout>
              </h4>
              <p className={styles.requests}>
                Now that the 'payment_id' stored in your server, you can use it
                to access the payment information:
              </p>
            </>
          ) : (
            /* If not using the payment_initiation product, show the item_id and access_token information */ <>
              {isItemAccess ? (
                <h4 className={styles.subtitle}>
                  Congrats! By linking an account, you have created an{" "}
                  <InlineLink
                    href="http://plaid.com/docs/quickstart/glossary/#item"
                    target="_blank"
                  >
                    Item
                  </InlineLink>
                  .
                </h4>
              ) : userToken || userId ? (
                <h4 className={styles.subtitle}>
                  Congrats! You have successfully linked data to a User.
                </h4>
              ) : (
                <h4 className={styles.subtitle}>
                  <Callout warning>
                    Unable to create an item. Please check your backend server
                  </Callout>
                </h4>
              )}
              <div className={styles.itemAccessContainer}>
                {itemId && (
                  <p className={styles.itemAccessRow}>
                    <span className={styles.idName}>item_id</span>
                    <span className={styles.tokenText}>{itemId}</span>
                  </p>
                )}

                {accessToken && (
                  <p className={styles.itemAccessRow}>
                    <span className={styles.idName}>access_token</span>
                    <span className={styles.tokenText}>{accessToken}</span>
                  </p>
                )}

                {userToken && (
                  <p className={styles.itemAccessRow}>
                    <span className={styles.idName}>user_token</span>
                    <span className={styles.tokenText}>{userToken}</span>
                  </p>
                )}

                {userId && (
                  <p className={styles.itemAccessRow}>
                    <span className={styles.idName}>user_id</span>
                    <span className={styles.tokenText}>{userId}</span>
                  </p>
                )}
              </div>
              {(isItemAccess || userToken || userId) && (
                <p className={styles.requests}>
                  Now that you have {accessToken && "an access_token"}
                  {accessToken && (userToken || userId) && " and "}
                  {userToken && "a user_token"}
                  {userToken && userId && " and "}
                  {userId && "a user_id"}, you can make all of the
                  following requests:
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

Header.displayName = "Header";

export default Header;
