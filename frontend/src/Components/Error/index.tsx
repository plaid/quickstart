import React, { useEffect, useState } from "react";

import { ErrorDataItem } from "../../dataUtilities";

import styles from "./index.module.css";

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
        <div className={styles.code}>
          <span className="inline-block self-start rounded-sm border border-[var(--color-red-400)] bg-[var(--color-red-200)] px-[0.8rem] py-[0.2rem] font-mono text-[1.4rem] font-semibold leading-normal">
            {props.error.status_code ? props.error.status_code : "error"}
          </span>
        </div>
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
        {props.error.error_code === "INVALID_LINK_CUSTOMIZATION" && (
          <div className={styles.errorItem}>
            <span className={styles.errorMessage}>
              <strong>Tip:</strong> In the{" "}
              <a
                href="https://dashboard.plaid.com/link/data-transparency-v5"
                target="_blank"
                className="underline"
              >
                dashboard under Link &gt; Link Customization Data Transparency
                Messaging
              </a>
              , ensure at least one use case is selected. After selecting a use
              case, make sure to click <strong>Publish Changes</strong>.
            </span>
          </div>
        )}
        {props.error.error_code === "INSTITUTION_REGISTRATION_REQUIRED" && (
          <div className={styles.errorItem}>
            <span className={styles.errorMessage}>
              Certain OAuth institutions, including Bank of America, Chase,
              Capital One, and American Express, may take up to 24 hours to
              become available after obtaining Production access. PNC and Charles
              Schwab require a{" "}
              <a
                href="https://dashboard.plaid.com/activity/status/oauth-institutions"
                target="_blank"
                className="underline"
              >
                special registration process
              </a>{" "}
              to access Production data.
            </span>
          </div>
        )}
        <div className={styles.learnMore}>
          <a
            className="inline-flex w-full items-center justify-center rounded bg-[var(--color-black-1000)] px-[1.6rem] py-[0.8rem] text-[1.4rem] font-semibold text-white no-underline hover:opacity-90"
            target="_blank"
            href={path}
          >
            Learn more
          </a>
        </div>
      </div>
    </>
  );
};

Error.displayName = "Error";

export default Error;
