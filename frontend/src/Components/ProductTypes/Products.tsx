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
    <ProductTypesContainer productType="Transactions">
      <Endpoint
        endpoint="transactions"
        name="Transactions"
        categories={transactionsCategories}
        schema="/transactions/get/"
        description="Retrieve transactions for credit and depository accounts."
        transformData={transformTransactionsData}
      />
    </ProductTypesContainer>
  );
};

Products.displayName = "Transactions";

export default Products;
