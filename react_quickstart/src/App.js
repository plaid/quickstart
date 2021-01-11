import React, { useEffect, useState } from "react";
import axios from "axios";

import LinkButton from "./Components/LinkButton";

import styles from "./App.module.scss";

const App = () => {
  const [link_token, setLink_token] = useState(true);
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    let tokenData;
    async function getLinkToken() {
      tokenData = await axios
        .post("/api/create_link_token", {})
        .then((data) => {
          if (data.error != null) {
            setLink_token(false);
            return;
          } else return data;
        });
      if (tokenData.data) {
        setLink_token(tokenData.data.link_token);
      }
    }
    getLinkToken();
  }, []);

  async function getTransactions() {
    let result = await axios.get(`/api/transactions`);
    let transactions = result.data.transactions;
    transactions = transactions.filter((trans) => {
      return trans.transaction_type === "place";
    });
    setTransactions(transactions);
  }

  let openPlaid = link_token ? (
    <LinkButton token={link_token} />
  ) : (
    <div>Nothing here yet</div>
  );

  let displayTransactions = transactions ? (
    <div></div>
  ) : (
    <button className={styles.ShowBarChartBtn} onClick={getTransactions}>
      Show me transactions
    </button>
  );

  return (
    <div className={styles.App}>
      <div className={styles.Header}>Plaid Quickstart</div>
      <div className={styles.Subheader}>
        A sample end-to-end integration with Plaid
      </div>
      {openPlaid}
      {displayTransactions}
      {transactions && (
        <div>yes, there are transactions! {transactions[8].amount}</div>
      )}
    </div>
  );
};

export default App;
