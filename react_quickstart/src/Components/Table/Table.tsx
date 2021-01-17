import React from "react";
import ReactDOM from "react-dom";
import cx from "classnames";

import { DataItem, Categories } from "../../Utilities/productUtilities";

import styles from "./Table.module.scss";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
  identity?: boolean;
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

const Table = (props: Props) => {
  const headers = props.categories.map((category) => (
    <th
      className={cx(
        styles.headerField,
        props.identity && styles.idendityHeaderField
      )}
    >
      {category.title}
    </th>
  ));

  let rows = props.data.map((item: DataItem | any) => {
    return (
      <tr
        className={cx(
          styles.dataRows,
          props.identity && styles.idendityDataRows
        )}
      >
        {props.categories.map((category: Categories) => {
          return (
            <td
              className={cx(
                styles.dataField,
                props.identity && styles.idendityDataField
              )}
            >
              {category.field === "amount" ||
              category.field === "balance" ||
              category.field === "value" ||
              category.field === "price"
                ? formatter.format(item[category.field])
                : item[category.field]}
            </td>
          );
        })}
      </tr>
    );
  });

  rows = rows.length < 8 ? rows : rows.slice(0, 8);

  return (
    <table className={styles.dataTable}>
      <thead
        className={cx(styles.header, props.identity && styles.identityHeader)}
      >
        <tr
          className={cx(
            styles.headerRow,
            props.identity && styles.identityHeaderRow
          )}
        >
          {headers}
        </tr>
      </thead>
      <tbody className={styles.body}>{rows}</tbody>
    </table>
  );
};

Table.displayName = "Table";

export default Table;
