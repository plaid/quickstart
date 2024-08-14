import React, { useContext } from "react";

import Endpoint from "../Endpoint";
import Context from "../../Context";
import ProductTypesContainer from "./ProductTypesContainer";
import {
  transactionsCategories,
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  investmentsTransactionsCategories,
  liabilitiesCategories,
  paymentCategories,
  assetsCategories,
  incomePaystubsCategories,
  transferCategories,
  transferAuthorizationCategories,
  signalCategories,
  statementsCategories,
  transformAuthData,
  transformTransactionsData,
  transformBalanceData,
  transformInvestmentsData,
  transformInvestmentTransactionsData,
  transformLiabilitiesData,
  transformIdentityData,
  transformPaymentData,
  transformAssetsData,
  transformTransferData,
  transformTransferAuthorizationData,
  transformIncomePaystubsData,
  transformSignalData,
  transformStatementsData,
  transformBaseReportGetData,
  transformIncomeInsightsData,
  checkReportBaseReportCategories,
  checkReportInsightsCategories,
  transformPartnerInsightsData,
  checkReportPartnerInsightsCategories
} from "../../dataUtilities";

const Products = () => {
  const { products, isCraProductsExclusively } = useContext(Context);
  return (
    <ProductTypesContainer productType="Products">
      {products.includes("payment_initiation") && (
        <Endpoint
          endpoint="payment"
          name="Payment"
          categories={paymentCategories}
          schema="/payment/get/"
          description="Retrieve information about your latest payment."
          transformData={transformPaymentData}
        />
      )}
      {products.includes("auth") && (
        <Endpoint
            endpoint="auth"
            name="Auth"
            categories={authCategories}
            schema="/auth/get/"
            description="Retrieve account and routing numbers for checking and savings accounts."
            transformData={transformAuthData}
        />
      )}
      {products.includes("transactions") && (
        <Endpoint
          endpoint="transactions"
          name="Transactions"
          categories={transactionsCategories}
          schema="/transactions/sync/"
          description="Retrieve transactions or incremental updates for credit and depository accounts."
          transformData={transformTransactionsData}
        />
      )}
      {products.includes("identity") && (
        <Endpoint
              endpoint="identity"
              name="Identity"
              categories={identityCategories}
              schema="/identity/get/"
              description="Retrieve Identity information on file with the bank. Reduce
              fraud by comparing user-submitted data to validate identity."
              transformData={transformIdentityData}
        />
      )}
      {products.includes("assets") && (
        <Endpoint
          endpoint="assets"
          name="Assets"
          categories={assetsCategories}
          schema="/asset_report/get/"
          description="Create and retrieve assets information an asset report"
          transformData={transformAssetsData}
        />
      )}
      {!products.includes("payment_initiation") && !isCraProductsExclusively && (
          <Endpoint
              endpoint="balance"
              name="Balance"
              categories={balanceCategories}
              schema="/accounts/balance/get/"
              description="Check balances in real time to prevent non-sufficient funds
        fees."
              transformData={transformBalanceData}
          />
      )}
      {products.includes("investments") && (
        <>
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
      <Endpoint
        endpoint="investments_transactions"
        name="Investments Transactions"
        categories={investmentsTransactionsCategories}
        schema="/investments/transactions/get"
        description="Retrieve investment transactions on file with the bank,
        brokerage, or investments institution."
        transformData={transformInvestmentTransactionsData}
      />
      <Endpoint
        endpoint="liabilities"
        name="Liabilities"
        categories={liabilitiesCategories}
        schema="/liabilities/get"
        description="Retrieve liabilities and various details about an Item with loan or credit accounts."
        transformData={transformLiabilitiesData}
      />
      </>
      )}
      {products.includes("transfer") && (
        <>
        <Endpoint
            endpoint="transfer_authorize"
            name="Transfer"
            categories={transferAuthorizationCategories}
            schema="/transfer/authorization/create"
            description="Authorize a new 1-dollar ACH transfer payment from the linked account"
            transformData={transformTransferAuthorizationData}
          />
          <Endpoint
            endpoint="transfer_create"
            name="Transfer"
            categories={transferCategories}
            schema="/transfer/create/"
            description="(After calling /transfer/authorization/create) Execute an authorized 1-dollar ACH transfer payment from the first linked account"
            transformData={transformTransferData}
          />
        </>
      )}
      {products.includes("signal") && (
        <>
        <Endpoint
            endpoint="signal_evaluate"
            name="Signal"
            categories={signalCategories}
            schema="/signal/evaluate"
            description="Evaluate the return risk of a proposed $100 debit from the first linked account (in Sandbox, results are randomly generated)"
            transformData={transformSignalData}
          />
        </>
      )}
      {products.includes("statements") && (
        <>
        <Endpoint
            endpoint="statements"
            name="Statements"
            categories={statementsCategories}
            schema="/statements/list and /statements/download"
            description="List out and download the most recent statement"
            transformData={transformStatementsData}
          />
        </>
      )}

      {products.includes("income_verification") && (
        <Endpoint
          endpoint="/income/verification/paystubs"
          name="Income Paystubs"
          categories={incomePaystubsCategories}
          schema="/income/verification/paystubs"
          description="(Deprecated) Retrieve information from the paystubs used for income verification"
          transformData={transformIncomePaystubsData}
          />
      )}

      {(products.includes("cra_base_report") || products.includes("cra_income_insights")) && (
        <Endpoint
          endpoint="/cra/get_base_report"
          name="CRA Base Report"
          categories={checkReportBaseReportCategories}
          schema="/cra/check_report/base_report/get"
          description="Retrieve a Consumer Report powered by Plaid Check"
          transformData={transformBaseReportGetData}
        />
      )}

      {(products.includes("cra_base_report") || products.includes("cra_income_insights")) && (
        <Endpoint
          endpoint="/cra/get_income_insights"
          name="CRA Income Insights"
          categories={checkReportInsightsCategories}
          schema="/cra/check_report/income_insights/get"
          description="Retrieve cash flow information from your user's banks"
          transformData={transformIncomeInsightsData}
        />
      )}

      {products.includes("cra_partner_insights") && (
        <Endpoint
          endpoint="/cra/get_partner_insights"
          name="CRA Partner Insights"
          categories={checkReportPartnerInsightsCategories}
          schema="/cra/check_report/partner_insights/get"
          description="Retrieve cash flow insights from partners"
          transformData={transformPartnerInsightsData}
        />
      )}
    </ProductTypesContainer>
  );
};

Products.displayName = "Products";

export default Products;
