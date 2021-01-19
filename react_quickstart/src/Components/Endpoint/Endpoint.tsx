import React, { useState } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import Table from "../Table/Table";
import Error from "../Error/Error";

import { DataItem, Categories } from "../../Utilities/dataUtilities";

import styles from "./Endpoint.module.scss";

interface Props {
  endpoint: string;
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

const Endpoint = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error>({});

  const getData = async () => {
    const response = await fetch(`/api/${props.endpoint}`, { method: "GET" });
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
      <div className={styles.endpointContainer}>
        <Note info className={styles.post}>
          POST
        </Note>
        <div className={styles.endpointContents}>
          <div className={styles.endpointHeader}>
            {props.name && (
              <span className={styles.endpointName}>{props.name}</span>
            )}
            <span className={styles.schema}>{props.schema}</span>
          </div>
          <div className={styles.endpointDescription}>{props.description}</div>
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
          identity={props.endpoint === "identity"}
        />
      )}
      {isError && <Error error={error} />}
    </>
  );
};

Endpoint.displayName = "Endpoint";

export default Endpoint;
