import React, { useContext } from "react";

import Endpoint from "../Endpoint";
import Context from "../../Context";
import ProductTypesContainer from "./ProductTypesContainer";
import {
  incomeEmployeeCategories,
  transformIncomeEmployeeData,
 
} from "../../dataUtilities";

const ProductIncome = () => {
  return (
    <ProductTypesContainer productType="Verfification of Income endpoints">

      <Endpoint
        endpoint="income/paystubs"
        name="Income Verification"
        categories={incomeEmployeeCategories}
        schema="/income/paystubs/get/"
        description="Pay detail get"
        transformData={transformIncomeEmployeeData}
      />
    </ProductTypesContainer>
  );
};

ProductIncome.displayName = "IncomeProduct";

export default ProductIncome;
