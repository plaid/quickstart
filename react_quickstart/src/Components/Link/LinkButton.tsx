import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import Button from "plaid-threads/Button";

import styles from "./LinkButton.module.scss";

interface Props {
  linkToken: string;
  setLinkSuccess: (arg: boolean) => void;
  setItemId: (arg: string) => void;
  setAccessToken: (arg: string) => void;
  currentPath: string;
}

const LinkButton: React.FC<Props> = (props: Props) => {
  // const [isOauth, setIsOauth] = useState(false);

  const onSuccess = React.useCallback((public_token: string) => {
    // send public_token to server
    const getToken = async () => {
      const response = await fetch("/api/set_access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_token: public_token,
        }),
      });
      const data = await response.json();
      props.setItemId(data.item_id);
      props.setAccessToken(data.access_token);
    };
    getToken();
    props.setLinkSuccess(true);
    window.history.pushState("", "", "/");
  }, []);

  let isOauth = false;
  let config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken,
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

  let { open, ready, error } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <>
      <Button type="button" large onClick={() => open()} disabled={!ready}>
        Launch Link
      </Button>
    </>
  );
};

LinkButton.displayName = "LinkButton";

export default LinkButton;
