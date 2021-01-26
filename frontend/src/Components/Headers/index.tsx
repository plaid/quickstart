import React, { useState, useContext } from "react";
import Note from "plaid-threads/Note";
import Context from "../../Context";

import Link from "../Link";

import styles from "./index.module.scss";

interface Props {
  linkToken: string | null;
  linkSuccess: boolean;
  setLinkSuccess: (arg: boolean) => void;
  setIsItemAccess: (arg: boolean) => void;
  isItemAccess: boolean;
  currentPath: string;
}

const Header = (props: Props) => {
  const [itemId, setItemId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [context, setContext] = useContext(Context);

  return (
    <div className={styles.grid}>
      <h3 className={styles.title}>Plaid Quickstart</h3>
      {!props.linkSuccess && (
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
          {props.linkToken == null && (
            <Note error solid className={styles.runBackendError}>
              Unable to fetch link_token: please make sure your backend server
              is running.
            </Note>
          )}
          {props.linkToken != null && (
            <div className={styles.linkButton}>
              <Link
                setLinkSuccess={props.setLinkSuccess}
                linkToken={props.linkToken}
                setItemId={setItemId}
                setAccessToken={setAccessToken}
                currentPath={props.currentPath}
                setIsItemAccess={props.setIsItemAccess}
              />
            </div>
          )}
        </>
      )}
      {props.linkSuccess && (
        <>
          {props.isItemAccess && (
            <h4 className={styles.subtitle}>
              Congrats! By linking an account, you have created an{" "}
              <span className={styles.itemText}>Item</span>.
            </h4>
          )}
          {!props.isItemAccess && (
            <h4 className={styles.subtitle}>
              Unable to create an <span className={styles.itemText}>Item</span>.
              Please check your backend server
            </h4>
          )}
          <div className={styles.itemAccessContainer}>
            <p className={styles.itemAccessRow}>
              <span className={styles.idName}>item_id</span>
              <span className={styles.tokenText}>{itemId}</span>
            </p>

            <p className={styles.itemAccessRow}>
              <span className={styles.idName}>access_token</span>
              <span className={styles.tokenText}>{accessToken}</span>
            </p>
          </div>
          {props.isItemAccess && (
            <p className={styles.requests}>
              Now that you have an access token, you can make all of the
              following requests:
            </p>
          )}
        </>
      )}
    </div>
  );
};

Header.displayName = "Header";

export default Header;
