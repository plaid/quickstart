import React from "react";

import { DataItem, Categories } from "../../Utilities/dataUtilities";

import styles from "./Table.module.scss";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
  identity: boolean;
}

const Table = (props: Props) => {
  // regular table
  const headers = props.categories.map((category) => (
    <th className={styles.headerField}>{category.title}</th>
  ));

  let rows = props.data
    .map((item: DataItem | any) => {
      return (
        <tr className={styles.dataRows}>
          {props.categories.map((category: Categories) => {
            return <td className={styles.dataField}>{item[category.field]}</td>;
          })}
        </tr>
      );
    })
    .slice(0, 8);

  //identity table to accomodate odd data structure of identity product
  const identityHeaders = props.categories.map((category) => (
    <span className={styles.identityHeader}>{category.title}</span>
  ));

  const identityRows = props.data.map((item: DataItem | any) => {
    return (
      <div className={styles.identityDataRow}>
        {props.categories.map((category: Categories) => {
          return (
            <span className={styles.identityDataField}>
              {item[category.field]}
            </span>
          );
        })}
      </div>
    );
  });

  if (props.identity) {
    return (
      <div className={styles.identityTable}>
        <div className={styles.identityHeadersRow}>{identityHeaders}</div>{" "}
        <div className={styles.identityDataBody}>{identityRows}</div>
      </div>
    );
  }

  return (
    <table className={styles.dataTable}>
      <thead className={styles.header}>
        <tr className={styles.headerRow}>{headers}</tr>
      </thead>
      <tbody className={styles.body}>{rows}</tbody>
    </table>
  );
};

Table.displayName = "Table";

export default Table;
