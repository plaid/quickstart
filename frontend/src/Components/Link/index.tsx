import React, { useEffect, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import Button from "plaid-threads/Button";

import Context from "../../Context";

interface Props {
  currentPath: string;
}

const Link: React.FC<Props> = (props: Props) => {
  const {
    itemId,
    accessToken,
    linkToken,
    linkSuccess,
    isItemAccess,
    dispatch,
  } = useContext(Context);

  const onSuccess = React.useCallback(
    (public_token: string) => {
      // send public_token to server
      const setToken = async () => {
        const response = await fetch("/api/set_access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: `public_token=${public_token}`,
        });
        if (!response.ok) {
          dispatch({
            type: "SET_STATE",
            state: { itemId: `no item_id retrieved` },
          });
          dispatch({
            type: "SET_STATE",
            state: { accessToken: `no access_token retrieved` },
          });
          dispatch({ type: "SET_STATE", state: { isItemAccess: false } });
        } else {
          const data = await response.json();
          dispatch({ type: "SET_STATE", state: { itemId: data.item_id } });
          dispatch({
            type: "SET_STATE",
            state: { accessToken: data.access_token },
          });
          dispatch({ type: "SET_STATE", state: { isItemAccess: true } });
        }
      };
      setToken();
      dispatch({ type: "SET_STATE", state: { linkSuccess: true } });
      window.history.pushState("", "", "/");
    },
    [props]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
    clientName: "hello world",
    env: "sandbox",
    product: ["auth", "transactions"],
  };

  if (window.location.href.includes("?oauth_state_id=")) {
    // TODO: figure out how to delete this ts-ignore
    // @ts-ignore
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <Button type="button" large onClick={() => open()} disabled={!ready}>
      Launch Link
    </Button>
  );
};

Link.displayName = "Link";

export default Link;
