import React, { useState } from "react";
import ReactDOM from "react-dom";
import cx from "classnames";
import Note from "plaid-threads/Note";

import LinkButton from "../Link/LinkButton";

import styles from "./HeaderStart.module.scss";

interface Props {
  linkToken: string | null;
  linkSuccess: boolean;
  setLinkSuccess: (arg: boolean) => void;
  currentPath: string;
  isError: boolean;
}
const HeaderStart = (props: Props) => {
  const [itemId, setItemId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  return (
    <div className={styles.grid}>
      {" "}
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
          <div className={styles.linkButton}>
            {props.isError && (
              <Note error solid className={styles.runBackendError}>
                No link token: please start the backend server
              </Note>
            )}
            {props.linkToken != null && !props.linkSuccess && (
              <LinkButton
                setLinkSuccess={props.setLinkSuccess}
                linkToken={props.linkToken}
                setItemId={setItemId}
                setAccessToken={setAccessToken}
                currentPath={props.currentPath}
              />
            )}
          </div>
        </>
      )}
      {props.linkSuccess && (
        <>
          <h4 className={styles.subtitle}>
            Congrats! By linking an account, you have created an{" "}
            <span className={styles.itemText}>Item</span>.
          </h4>
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
          <p className={styles.requests}>
            Now that you have an access token, you can make all of the following
            requests:
          </p>
        </>
      )}
    </div>
  );
};

HeaderStart.displayName = "HeaderStart";

export default HeaderStart;
