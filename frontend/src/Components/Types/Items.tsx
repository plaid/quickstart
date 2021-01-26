import React from "react";

import Endpoint from "../Endpoint";
import TypeContainer from "./TypeContainer";
import {
  transformItemData,
  transformAccountsData,
  itemCategories,
  accountsCategories,
} from "../../dataUtilities";

import styles from "./index.module.scss";

const Items = () => (
  <>
    <TypeContainer title="Item Management">
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
    </TypeContainer>
  </>
);

Items.displayName = "Items";

export default Items;
