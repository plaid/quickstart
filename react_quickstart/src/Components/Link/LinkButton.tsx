import React, { useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import Button from "plaid-threads/Button";
import cx from "classnames";
import axios from "axios";

import styles from "./LinkButton.module.scss";

interface Props {
  linkToken: string;
  setLinkSuccess: (arg: boolean) => void;
  setItemId: (arg: string) => void;
  setAccessToken: (arg: string) => void;
}

const LinkButton: React.FC<Props> = (props: Props) => {
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
  }, []);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken,
    onSuccess,
    clientName: "hello world",
    env: "sandbox",
    product: ["auth", "transactions"],
  };

  const { open, ready, error } = usePlaidLink(config);
  const launchLink = () => {
    open();
  };

  return (
    <>
      <Button type="button" small onClick={launchLink} disabled={!ready}>
        Launch Link
      </Button>
    </>
  );
};

LinkButton.displayName = "LinkButton";

export default LinkButton;
