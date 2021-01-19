import React, { useEffect, useState } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import {
  DataItem as DataItem,
  Categories,
} from "../../Utilities/dataUtilities";

import styles from "./Error.module.scss";
interface Props {
  error: Errors | DataItem;
}
interface Errors {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
  status_code: number;
}

const errorPaths: { [key: string]: string } = {
  ITEM_ERROR: "item",
  INSTITUTION_ERROR: "institution",
  API_ERROR: "api",
  ASSET_REPORT_ERROR: "assets",
  BANK_TRANSFER_ERROR: "bank-transfers",
  INVALID_INPUT: "invalid-input",
  INVALID_REQUEST: "invalid-request",
  INVALID_RESULT: "invalid-result",
  OAUTH_ERROR: "oauth",
  PAYMENT_ERROR: "payment",
  RATE_LIMIT_EXCEEDED: "rate-limit-exceeded",
  RECAPTCHA_ERROR: "recaptcha",
  SANDBOX_ERROR: "sandbox",
};

const Error = (props: Props) => {
  const [path, setPath] = useState("");

  useEffect(() => {
    const errorType = props.error.error_type!;
    const errorPath = errorPaths[errorType];

    setPath(
      `https://plaid.com/docs/errors/${errorPath}/#${props.error.error_code?.toLowerCase()}`
    );
  }, []);

  return (
    <>
      <div className={styles.errorContainer}>
        <Note error className={styles.code}>
          {props.error.status_code}
        </Note>
        <div className={styles.errorContents}>
          <div className={styles.errorItem}>
            <span className={styles.errorTitle}>Error code: </span>
            <span className={styles.errorData}>{props.error.error_code}</span>
          </div>
          <div className={styles.errorItem}>
            <span className={styles.errorTitle}>Type: </span>
            <span className={styles.errorData}>{props.error.error_type}</span>
          </div>
          <div className={styles.errorItem}>
            <span className={styles.errorTitle}>Message: </span>
            <span className={styles.errorData}>
              {props.error.display_message == null
                ? props.error.error_message
                : props.error.display_message}
            </span>
          </div>
        </div>
        <Button small wide className={styles.learnMore} href={path}>
          Learn More
        </Button>
      </div>
    </>
  );
};

Error.displayName = "Error";

export default Error;
