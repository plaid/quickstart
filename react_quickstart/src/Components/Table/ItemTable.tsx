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

const ItemTable = (props: Props) => {
  const headers = props.categories.map((category) => (
    <th
      className={cx(styles.headerField, props.identity && styles.idendityData)}
    >
      {category.title}
    </th>
  ));

  let rows = props.data.map((item: DataItem | any) => {
    return (
      <tr className={cx(styles.dataRows, props.identity && styles.idendityRow)}>
        {props.categories.map((category: Categories) => {
          return (
            <td
              className={cx(
                styles.dataField,
                props.identity && styles.idendityData
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
      <thead className={styles.header}>
        <tr
          className={cx(
            styles.headerRow,
            props.identity && styles.identityHeader
          )}
        >
          {headers}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

ItemTable.displayName = "ItemTable";

export default ItemTable;
