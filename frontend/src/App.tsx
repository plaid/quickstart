import React, { useEffect, useContext } from "react";

import Header from "./Components/Headers";
import Products from "./Components/Types/Products";
import Items from "./Components/Types/Items";
import Context from "./Context";

import styles from "./App.module.scss";

const App = () => {
  const { linkSuccess, isItemAccess, dispatch } = useContext(Context);

  const generateToken = async () => {
    const response = await fetch("/api/create_link_token", {
      method: "POST",
    });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { linkToken: null } });
    } else {
      const data = await response.json();
      if (data) {
        dispatch({ type: "SET_STATE", state: { linkToken: data.link_token } });
      }
      localStorage.setItem("link_token", data.link_token); //to use later for Oauth
    }
  };

  useEffect(() => {
    // do not generate a new token for OAuth redirect; instead
    // setLinkToken from localStorage
    if (window.location.href.includes("?oauth_state_id=")) {
      dispatch({
        type: "SET_STATE",
        state: { linkToken: localStorage.getItem("link_token") },
      });
      return;
    }
    generateToken();
  }, []);

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <Header currentPath={window.location.href} />
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
