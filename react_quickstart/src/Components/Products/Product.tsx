import React, { useEffect, useState } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import Table from "../Table/Table";
import Error from "../Error/Error";

import { DataItem, Categories } from "../../Utilities/productUtilities";

import styles from "./Product.module.scss";

interface Props {
  product: string;
  name?: string | null;
  categories: Array<Categories>;
  schema: string;
  description: string;
  transformData?: (arg: any) => Array<DataItem>;
}

interface Error {
  error_type?: string;
  error_code?: string;
  error_message?: string;
  display_message?: string | null;
}

type Data = Array<DataItem>;

const Product = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error>({});

  const getData = async () => {
    const response = await fetch(`/api/${props.product}`, { method: "GET" });
    const data = await response.json();
    if (data.error != null) {
      setError(data.error);
      setIsError(true);
    } else {
      setTransformedData(props.transformData!(data));
      setShowTable(true);
    }
  };

  return (
    <>
      <div className={styles.productContainer}>
        <Note info className={styles.post}>
          POST
        </Note>
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
          type="button"
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
          data={transformedData}
          identity={props.product === "identity"}
        />
      )}
      {isError && <Error error={error} />}
    </>
  );
};

Product.displayName = "Product";

export default Product;
