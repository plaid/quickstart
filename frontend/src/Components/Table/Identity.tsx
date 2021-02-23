import React from "react";

import { DataItem, Categories } from "../../dataUtilities";

import styles from "./Identity.module.scss";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
}

const Identity = (props: Props) => {
  const identityHeaders = props.categories.map((category, index) => (
    <span key={index} className={styles.identityHeader}>
      {category.title}
    </span>
  ));

  const identityRows = props.data.map((item: DataItem | any, index) => (
    <div key={index} className={styles.identityDataRow}>
      {props.categories.map((category: Categories, index) => (
        <span key={index} className={styles.identityDataField}>
          {item[category.field]}
        </span>
      ))}
    </div>
  ));

  return (
    <div className={styles.identityTable}>
      <div className={styles.identityHeadersRow}>{identityHeaders}</div>
      <div className={styles.identityDataBody}>{identityRows}</div>
    </div>
  );
};

Identity.displayName = "Identity";

export default Identity;
