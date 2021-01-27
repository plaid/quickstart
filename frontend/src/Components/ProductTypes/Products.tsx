import React from "react";

import Endpoint from "../Endpoint";
import ProductTypesContainer from "./ProductTypesContainer";
import {
  transactionsCategories,
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  transformAuthData,
  transformTransactionsData,
  transformBalanceData,
  transformInvestmentsData,
  transformIdentityData,
} from "../../dataUtilities";

const Products = () => {
  return (
    <ProductTypesContainer productType="Products">
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
    </ProductTypesContainer>
  );
};

Products.displayName = "Products";

export default Products;
