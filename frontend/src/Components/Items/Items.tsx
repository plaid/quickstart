import React from "react";

import Endpoint from "../Endpoint/Endpoint";
import {
  transformItemData,
  transformAccountsData,
} from "../../Utilities/dataUtilities";
import {
  itemCategories,
  accountsCategories,
} from "../../Utilities/dataUtilities";

import styles from "./Items.module.scss";

const Items = () => (
  <>
    <div className={styles.itemsContainer}>
      <h4 className={styles.itemsHeader}>Item Management</h4>
      <Endpoint
        endpoint="item"
        categories={itemCategories}
        schema="/item/get/"
        description="Retrieve information about an Item, like the institution,
        billed products, available products, and webhook
        information."
        transformData={transformItemData}
      />
      <Endpoint
        endpoint="accounts"
        schema="/accounts/get"
        categories={accountsCategories}
        description="Retrieve high-level information about all accounts associated with an item."
        transformData={transformAccountsData}
      />
    </div>
  </>
);

Items.displayName = "Items";

export default Items;
