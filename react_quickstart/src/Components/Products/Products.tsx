import React from "react";

import Endpoint from "../Endpoint/Endpoint";
import {
  transactionsCategories,
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  liabilitiesCategories,
} from "../../Utilities/dataUtilities";
import {
  transformAuthData,
  transformTransactionsData,
  transformBalanceData,
  transformInvestmentsData,
  transformIdentityData,
  transformLiabilitiesData,
} from "../../Utilities/dataUtilities";

import styles from "./Products.module.scss";

const Products = () => {
  return (
    <>
      <div className={styles.productsContainer}>
        <h4 className={styles.productsHeader}>Products</h4>

        <Endpoint
          endpoint="auth"
          name="Auth"
          categories={authCategories}
          schema="/auth/get/"
          description="Retrieve account and routing numbers for checking and savings accounts."
          transformData={transformAuthData}
        />
        <Endpoint
          endpoint="transactions"
          name="Transactions"
          categories={transactionsCategories}
          schema="/transactions/get/"
          description="Retrieve transactions for credit and depository accounts."
          transformData={transformTransactionsData}
        />

        <Endpoint
          endpoint="identity"
          name="Identity"
          categories={identityCategories}
          schema="/identity/get/"
          description="Retrieve Identity information on file with the bank. Reduce
        fraud by comparing user-submitted data to validate identity."
          transformData={transformIdentityData}
        />
        <Endpoint
          endpoint="balance"
          name="Balance"
          categories={balanceCategories}
          schema="/accounts/balance/get/"
          description="Check balances in real time to prevent non-sufficient funds
        fees."
          transformData={transformBalanceData}
        />
        <Endpoint
          endpoint="holdings"
          name="Investments"
          categories={investmentsCategories}
          schema="/investments/holdings/get/"
          description="Retrieve investment holdings on file with the bank,
        brokerage, or investment institution. Analyze over-exposure
        to market segments."
          transformData={transformInvestmentsData}
        />
        {/* <Endpoint
          endpoint="liabilities"
          name="Liabilities"
          categories={liabilitiesCategories}
          schema="/liabilities/get/"
          description="Retrieve student loans, mortgages, and credit cards."
          transformData={transformLiabilitiesData}
        /> */}
      </div>
    </>
  );
};

Products.displayName = "Products";

export default Products;
