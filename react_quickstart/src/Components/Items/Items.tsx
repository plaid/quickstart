import React, { useEffect, useState } from "react";

import Product from "../Products/Product";
import {
  transformItemData,
  transformAccountsData,
} from "../../Utilities/productUtilities";
import {
  itemCategories,
  accountsCategories,
} from "../../Utilities/productUtilities";

import styles from "./Items.module.scss";

const Items = () => (
  <>
    <div className={styles.itemsContainer}>
      <div className={styles.itemsHeader}>Item Management</div>
      <Product
        product="item"
        categories={itemCategories}
        schema="/item/get/"
        description="Retrieve information about an Item, like the institution,
        billed products, available products, and webhook
        information."
        transformData={transformItemData}
      />

      <Product
        product="accounts"
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
