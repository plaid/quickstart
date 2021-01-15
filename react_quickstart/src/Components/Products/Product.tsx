import React, { useEffect, useState } from "react";
import Button from "plaid-threads/Button";

import Table from "../Table/Table";

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

import { DataItems, Categories } from "../../Utilities/productUtilities";

import styles from "./Product.module.scss";

interface Props {
  product: string;
  name?: string | null;
  categories: Array<Categories>;
  schema: string;
  description: string;
}

interface ACH {
  account: string;
  routing: string;
  account_id: string;
}

interface Error {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
}

type Data = Array<DataItems>;

const Product = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [data, setData] = useState<Data>([]);
  const [isError, setIsError] = useState(false);

  const displayError = (error: Error) => {};

  const getData = async () => {
    const response = await fetch(`/api/${props.product}`, { method: "GET" });
    const data = await response.json();
    if (data.error != null) {
      setIsError(true);
      setData(data);
    }
    let final: Array<DataItems> = [];
    switch (props.product) {
      case "transactions":
        setData(data.transactions);
        break;
      case "auth":
        final = transformAuthData(data);
        setData(final);
        break;
      case "identity":
        final = transformIdentityData(data);
        setData(final);
        break;
      case "balance":
        final = transformBalanceData(data);
        setData(final);
        break;
      case "holdings":
        final = transformInvestmentsData(data);
        setData(final);
        break;
      case "liabilities":
        final = transformLiabilitiesData(data);
        setData(final);
        break;
      case "item":
        final = transformItemData(data.itemResponse, data.instRes);
        setData(final);
        break;
      case "accounts":
        final = transformAccountsData(data);
        setData(final);
        break;

      default:
        setData(data.transactions);
    }

    setShowTable(true);
  };

  return (
    <>
      <div className={styles.productContainer}>
        <div className={styles.post}>POST</div>
        <div className={styles.productContents}>
          <div className={styles.productHeader}>
            {props.name && (
              <span className={styles.productName}>{props.name}</span>
            )}
            <span className={styles.schema}>{props.schema}</span>
          </div>
          <div className={styles.productDescription}>{props.description}</div>
        </div>
        <Button
          small
          wide
          secondary
          className={styles.sendRequest}
          onClick={getData}
        >
          {" "}
          Send Request
        </Button>
      </div>
      {showTable && (
        <Table
          categories={props.categories}
          data={data}
          identity={props.product === "identity"}
        />
      )}
    </>
  );
};

Product.displayName = "Product";

export default Product;
