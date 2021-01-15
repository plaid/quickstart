import React, { useEffect, useState } from "react";
import Button from "plaid-threads/Button";

import { DataItems, Categories } from "../../Utilities/productUtilities";

import styles from "./Error.module.scss";
interface Props {
  error: Errors | DataItems;
}
interface Errors {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
}

const errorObj = {
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
  return (
    <>
      <div className={styles.errorTop}></div>
      <div className={styles.errorContainer}>
        <div className={styles.code}>400</div>
        <div className={styles.errorContents}>
          <div className={styles.errorCode}>
            <span className={styles.errorTitle}>Error code: </span>
            <span className={styles.errorData}>PRODUCTS_NOT_SUPPORTED</span>
          </div>
          <div className={styles.errorType}>
            <span className={styles.errorTitle}>Type: </span>
            <span className={styles.errorData}>ITEM_ERROR</span>
          </div>
          <div className={styles.errorMessage}>
            <span className={styles.errorTitle}>Message: </span>
            <span className={styles.errorData}>some message here</span>
          </div>
        </div>
        <Button small wide className={styles.learnMore}>
          Learn More
        </Button>
      </div>
    </>
  );
};

// return (
//     <table className={styles.dataTable}>
//       <thead
//         className={cx(styles.header, props.identity && styles.identityHeader)}
//       >
//         <tr
//           className={cx(
//             styles.headerRow,
//             props.identity && styles.identityHeaderRow
//           )}
//         >
//           {headers}
//         </tr>
//       </thead>
//       <tbody className={styles.body}>{rows}</tbody>
//     </table>
//   );
// };
Error.displayName = "Error";

export default Error;
