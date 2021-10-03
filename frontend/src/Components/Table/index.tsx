import React, {useContext} from "react";

import { DataItem, Categories } from "../../dataUtilities";
import Identity from "./Identity";
import Income from "./income";
import Context from "../../Context";


import styles from "./index.module.scss";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
  isIdentity: boolean;
}

const Table = (props: Props) => {

  //checking to see if Income item and routing to Income table
  const {isIncomeItem} = useContext(Context);
  if(isIncomeItem){
    return <Income data={props.data} />
  }

  const maxRows = 15;
  // regular table
  const headers = props.categories.map((category, index) => (
    <th key={index} className={styles.headerField}>
      {category.title}
    </th>
  ));

  const rows = props.data
    .map((item: DataItem | any, index) => (
      <tr key={index} className={styles.dataRows}>
        {props.categories.map((category: Categories, index) => (
          <td key={index} className={styles.dataField}>
            {item[category.field]}
          </td>
        ))}
      </tr>
    ))
    .slice(0, maxRows);

  return props.isIdentity ? (
    <Identity data={props.data} categories={props.categories} />
  ) : (
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
