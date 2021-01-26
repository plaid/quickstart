import React, { useEffect, useState } from "react";

import Header from "./Components/Headers";
import Products from "./Components/Types/Products";
import Items from "./Components/Types/Items";

import Context from "./Context";
import DocsProvider from "./Context";

import styles from "./App.module.scss";

const App = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [isItemAccess, setIsItemAccess] = useState(false);
  const [context, setContext] = useState(Context);

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
    console.log(context.linkSuccess);
    // do not generate a new token for OAuth redirect; instead
    // setLinkToken from localStorage
    if (window.location.href.includes("?oauth_state_id=")) {
      setLinkToken(localStorage.getItem("link_token"));
      return;
    }
    generateToken();
  }, []);

  return (
    // @ts-ignore
    <DocsProvider>
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
    </DocsProvider>
  );
};

export default App;
