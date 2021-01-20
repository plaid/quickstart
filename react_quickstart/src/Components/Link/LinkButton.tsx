import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import Button from "plaid-threads/Button";

import OauthLink from "./OathLink";

import styles from "./LinkButton.module.scss";

interface Props {
  linkToken: string;
  setLinkSuccess: (arg: boolean) => void;
  setItemId: (arg: string) => void;
  setAccessToken: (arg: string) => void;
  currentPath: string;
}

const LinkButton: React.FC<Props> = (props: Props) => {
  const [isOauth, setIsOauth] = useState(false);

  const onSuccess = React.useCallback((public_token: string) => {
    alert("success");
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
  }, []);

  let config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken,
    onSuccess,
    clientName: "hello world",
    env: "sandbox",
    product: ["auth", "transactions"],
  };

  let { open, ready, error } = usePlaidLink(config);

  useEffect(() => {
    if (
      props.currentPath.slice(0, 34) === "http://localhost:3000/?oauth_state"
    ) {
      setIsOauth(true);
    }
  }, [ready, open]);

  if (isOauth) {
    return (
      <OauthLink
        setLinkSuccess={props.setLinkSuccess}
        setItemId={props.setItemId}
        setAccessToken={props.setAccessToken}
      />
    );
  }

  return (
    <>
      <Button
        className={styles.launchLink}
        type="button"
        large
        wide
        onClick={() => open()}
        disabled={!ready}
      >
        Launch Link
      </Button>
    </>
  );
};

LinkButton.displayName = "LinkButton";

export default LinkButton;
