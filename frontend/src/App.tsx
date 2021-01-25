import React, { useEffect, useState } from "react";

import Header from "./Components/Headers/Header";
import Products from "./Components/Products/Products";
import Items from "./Components/Items/Items";

import styles from "./App.module.scss";

const App = () => {
  const [linkToken, setLinkToken] = useState<string | null>("");
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [isItemAccess, setIsItemAccess] = useState(false);

  const generateToken = async () => {
    const response = await fetch("/api/create_link_token", {
      method: "POST",
    });
    if (!response.ok) {
      setLinkToken(null);
    } else {
      const data = await response.json();
      if (data) setLinkToken(data.link_token);
      localStorage.setItem("link_token", data.link_token); //to use later for Oauth
    }
  };

  useEffect(() => {
    // do not generate a new token for oauth second Link open; instead
    //setLinkTokean from first Link open that was set in local storage
    if (window.location.href.includes("?oauth_state_id=")) {
      setLinkToken(localStorage.getItem("link_token"));
      return;
    }
    generateToken();
  }, []);

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <Header
          currentPath={window.location.href}
          linkToken={linkToken}
          linkSuccess={linkSuccess}
          setLinkSuccess={setLinkSuccess}
          setIsItemAccess={setIsItemAccess}
          isItemAccess={isItemAccess}
        />
        {linkSuccess && isItemAccess && (
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
