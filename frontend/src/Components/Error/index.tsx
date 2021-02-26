import React, { useEffect, useState } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import { ErrorDataItem } from "../../dataUtilities";

import styles from "./index.module.scss";

interface Props {
  error: ErrorDataItem;
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
  }, [props.error]);

  return (
    <>
      <div className={styles.errorTop}></div>
      <div className={styles.errorContainer}>
        <Note error className={styles.code}>
          {props.error.status_code ? props.error.status_code : "error"}
        </Note>
        <div className={styles.errorContents}>
          <div className={styles.errorItem}>
            <span className={styles.errorTitle}>Error code: </span>
            <span className={styles.errorData}>
              <div className={styles.errorCode}>
                {props.error.error_code}
                <div className={styles.pinkBox}></div>
              </div>
            </span>
          </div>
          <div className={styles.errorItem}>
            <span className={styles.errorTitle}>Type: </span>
            <span className={styles.errorData}>{props.error.error_type}</span>
          </div>
          <div className={styles.errorItem}>
            <span className={styles.errorTitle}>Message: </span>
            <span className={styles.errorMessage}>
              {props.error.display_message == null
                ? props.error.error_message
                : props.error.display_message}
            </span>
          </div>
        </div>
        <Button
          small
          wide
          className={styles.learnMore}
          target="_blank"
          href={path}
        >
          Learn more
        </Button>
      </div>
    </>
  );
};

Error.displayName = "Error";

export default Error;
