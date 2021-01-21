import React, { useEffect, useState } from "react";

import HeaderStart from "./Components/Headers/HeaderStart";
import Products from "./Components/Products/Products";
import Items from "./Components/Items/Items";

import styles from "./App.module.scss";

const App = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const generateToken = async () => {
    const response = await fetch("/api/create_link_token", {
      method: "POST"
    });
    const data = await response.json();
    setLinkToken(data.link_token);
    localStorage.setItem("link_token", data.link_token);
  };

  useEffect(() => {
    // do not generate a new token for oauth second Link open
    if (window.location.href.includes("?oauth_state_id=")) {
      setLinkToken(localStorage.getItem("link_token"));
      return;
    }
    generateToken();
  }, []);

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <HeaderStart
          currentPath={window.location.href}
          linkToken={linkToken}
          linkSuccess={linkSuccess}
          setLinkSuccess={setLinkSuccess}
        />
        {linkSuccess && (
          <>
            <Products />
            <Items />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
