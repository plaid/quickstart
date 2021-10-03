import React from "react";

import { DataItem } from "../../dataUtilities";

import styles from "./index.module.scss";

interface Props {
  data: Array<DataItem>;
}


const Income = (props: Props) => {

    const rawData = props.data

    console.log(rawData)
    const incomeInfoSection = () => {
            <div className={styles.headerRow} >{"hello"}</div>
    }
//   const identityHeaders = props.categories.map((category, index) => (
//     <span key={index} className={styles.identityHeader}>
//       {category.title}
//     </span>
//   ));

//   const identityRows = props.data.map((item: DataItem | any, index) => (
//     <div key={index} className={styles.identityDataRow}>
//       {props.categories.map((category: Categories, index) => (
//         <span key={index} className={styles.identityDataField}>
//           {item[category.field]}
//         </span>
//       ))}
//     </div>
//   ));


  return (
      
    <div className={styles.header}>{"13232"}
      <div className={styles.header}>{"hello"}</div>
      <div className={styles.identityDataBody}>{"hithere"}</div>
    </div>
  );
};

Income.displayName = "Income";

export default Income;
