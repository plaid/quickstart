import React, { useEffect, useState } from "react";

import Product from "./Product";
import {
  transactionsCategories,
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  liabilitiesCategories,
} from "../../Utilities/productUtilities";
import {
  transformAuthData,
  transformTransactionsData,
  transformBalanceData,
  transformInvestmentsData,
  transformIdentityData,
  transformItemData,
  transformLiabilitiesData,
  transformAccountsData,
} from "../../Utilities/productUtilities";
import styles from "./Products.module.scss";

export interface Categories {
  title: string;
  field: string;
}

interface ProdCategories {
  transactions: Array<Categories>;
}

const Products = () => {
  return (
    <>
      <div className={styles.productsContainer}>
        <div className={styles.productsHeader}>Products</div>

        <Product
          product="auth"
          name="Auth"
          categories={authCategories}
          schema="/auth/get/"
          description="Retrieve account and routing numbers for checking and savings accounts."
          transformData={transformAuthData}
        />
        <Product
          product="transactions"
          name="Transactions"
          categories={transactionsCategories}
          schema="/transactions/get/"
          description="Retrieve transactions for credit and depository accounts."
          transformData={transformTransactionsData}
        />

        <Product
          product="identity"
          name="Identity"
          categories={identityCategories}
          schema="/identity/get/"
          description="Retrieve Identity information on file with the bank. Reduce
        fraud by comparing user-submitted data to validate identity."
          transformData={transformIdentityData}
        />
        <Product
          product="balance"
          name="Balance"
          categories={balanceCategories}
          schema="/accounts/balance/get/"
          description="Check balances in real time to prevent non-sufficient funds
        fees."
          transformData={transformBalanceData}
        />
        <Product
          product="holdings"
          name="Investments"
          categories={investmentsCategories}
          schema="/investments/holdings/get/"
          description="Retrieve investment holdings on file with the bank,
        brokerage, or investment institution. Analyze over-exposure
        to market segments."
          transformData={transformInvestmentsData}
        />
        <Product
          product="liabilities"
          name="Liabilities"
          categories={liabilitiesCategories}
          schema="/liabilities/get/"
          description="Retrieve student loans, mortgages, and credit cards."
          transformData={transformLiabilitiesData}
        />
      </div>
    </>
  );
};

Products.displayName = "Products";

export default Products;
