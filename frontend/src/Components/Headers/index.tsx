import React, { useContext } from "react";
import Note from "plaid-threads/Note";
import InlineLink from "plaid-threads/InlineLink";

import Link from "../Link";
import Context from "../../Context";

import styles from "./index.module.scss";

const Header = () => {
  const {
    itemId,
    accessToken,
    linkToken,
    linkSuccess,
    isItemAccess,
  } = useContext(Context);

  return (
    <div className={styles.grid}>
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
          {linkToken == null ? (
            <Note error solid className={styles.error}>
              Unable to fetch link_token: please make sure your backend server
              is running and that your .env file has been configured with your PLAID_CLIENT_ID and PLAID_SECRET.
            </Note>
          ) :
          linkToken===""?(<div className={styles.linkButton}>
            <Note>Loading...</Note>
          </div>):
          (
            <div className={styles.linkButton}>
              <Link />
            </div>
          )}
        </>
      ) : (
        <>
        </>
      )}
    </div>
  );
};

Header.displayName = "Header";

export default Header;
