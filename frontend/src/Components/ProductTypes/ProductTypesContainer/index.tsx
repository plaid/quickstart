import React from "react";

import styles from "./index.module.scss";

interface Props {
  children?: React.ReactNode | Array<React.ReactNode>;
  productType: string;
}

const TypeContainer: React.FC<Props> = (props) => (
  <div className={styles.container}>
    <h4 className={styles.header}>{props.productType}</h4>
    {props.children}
  </div>
);

TypeContainer.displayName = "TypeContainer";

export default TypeContainer;
