import React, { useEffect, useState } from "react";

import Product from "../Products/Product";
import {
  transactionsCategories,
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  itemCategories,
  accountsCategories,
} from "../../Utilities/productUtilities";
import {
  transformAuthData,
  transformTransactionsData,
} from "../../Utilities/productUtilities";

import styles from "./Items.module.scss";

export interface Categories {
  title: string;
  field: string;
}

interface ProdCategories {
  transactions: Array<Categories>;
}

const Items = () => {
  return (
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
        />

        <Product
          product="accounts"
          schema="/accounts/get"
          categories={accountsCategories}
          description="Retrieve high-level information about all accounts associated with an item."
        />
      </div>
    </>
  );
};

Items.displayName = "Items";

export default Items;
