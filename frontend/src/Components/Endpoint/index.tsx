import React, { useState } from "react";

import Table from "../Table";
import Error from "../Error";
import { DataItem, Categories, ErrorDataItem, Data } from "../../dataUtilities";

import styles from "./index.module.css";

interface Props {
  endpoint: string;
  name?: string;
  categories: Array<Categories>;
  schema: string;
  description: string;
  transformData: (arg: any) => Array<DataItem>;
}

const Endpoint = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<ErrorDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getData = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/${props.endpoint}`, { method: "GET" });
    const data = await response.json();
    if (data.error != null) {
      setError(data.error);
      setIsLoading(false);
      return;
    }
    setTransformedData(props.transformData(data)); // transform data into proper format for each individual product
    if (data.pdf != null) {
      setPdf(data.pdf);
    }
    setShowTable(true);
    setIsLoading(false);
  };

  const getPdfName = () => {
    switch(props.name) {
      case 'Assets':
        return "Asset Report.pdf";
      case "CRA Base Report":
        return "Plaid Check Report.pdf";
      case "CRA Income Insights":
        return "Plaid Check Report with Insights.pdf";
      default:
        return "Statement.pdf";
    }
  };

  return (
    <>
      <div className={styles.endpointContainer}>
        <div className={styles.post}>
          <span className="inline-block self-start rounded-sm border border-[var(--color-black-300)] bg-[var(--color-black-200)] px-[0.8rem] py-[0.2rem] font-mono text-[1.4rem] font-semibold leading-normal text-[var(--color-black-1000)]">
            POST
          </span>
        </div>
        <div className={styles.endpointContents}>
          <div className={styles.endpointHeader}>
            {props.name != null && (
              <span className={styles.endpointName}>{props.name}</span>
            )}
            <span className={styles.schema}>{props.schema}</span>
          </div>
          <div className={styles.endpointDescription}>{props.description}</div>
        </div>
        <div className={styles.buttonsContainer}>
          <button
            className={`${styles.sendRequest} inline-flex items-center justify-center rounded border border-[var(--color-black-1000)] bg-white px-[1.6rem] py-[0.8rem] text-[1.4rem] font-semibold text-[var(--color-black-1000)] hover:bg-[var(--color-black-100)]`}
            onClick={getData}
          >
            {isLoading ? "Loading..." : `Send request`}
          </button>
          {pdf != null && (
            <a
              className={`${styles.pdf} inline-flex items-center justify-center rounded bg-[var(--color-black-1000)] px-[1.6rem] py-[0.8rem] text-[1.4rem] font-semibold text-white no-underline hover:opacity-90`}
              href={`data:application/pdf;base64,${pdf}`}
              download={getPdfName()}
            >
              Download PDF
            </a>
          )}
        </div>
      </div>
      {showTable && (
        <Table
          categories={props.categories}
          data={transformedData}
          isIdentity={props.endpoint === "identity"}
        />
      )}
      {error != null && <Error error={error} />}
    </>
  );
};

Endpoint.displayName = "Endpoint";

export default Endpoint;
