import React, { useState } from "react";
import ReactDOM from "react-dom";
import cx from "classnames";

import LinkButton from "../Link/LinkButton";

import styles from "./HeaderStart.module.scss";

interface Props {
  linkToken: string | null;
  linkSuccess: boolean;
  setLinkSuccess: (arg: boolean) => void;
}
const HeaderStart = (props: Props) => {
  const [itemId, setItemId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  return (
    <div className={styles.grid}>
      {" "}
      <h1 className={styles.title}>Plaid Quickstart</h1>
      {!props.linkSuccess && (
        <>
          <h2 className={styles.subtitle}>
            A sample end-to-end integration with Plaid
          </h2>
          <p className={styles.introPar}>
            The Plaid flow begins when your user wants to connect their bank
            account to your app. Simulate this by clicking the button below to
            launch Link - the client-side component that your users will
            interact with in order to link their accounts to Plaid and allow you
            to access their accounts via the Plaid API.
          </p>
          <div className={styles.linkButton}>
            {props.linkToken != null && !props.linkSuccess && (
              <LinkButton
                setLinkSuccess={props.setLinkSuccess}
                linkToken={props.linkToken}
                setItemId={setItemId}
                setAccessToken={setAccessToken}
              />
            )}
          </div>
        </>
      )}
      {props.linkSuccess && (
        <>
          <h2 className={styles.subtitle}>
            Congrats! By linking an account, you have created an{" "}
            <span className={styles.itemText}>Item</span>.
          </h2>
          <div className={styles.itemAccessIds}>
            <p className={styles.id}>
              <span className={styles.idText}>item_id</span>
              <span className={styles.tokenText}>{itemId}</span>
            </p>

            <p className={styles.id}>
              <span className={styles.idText}>asccess_token</span>
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
