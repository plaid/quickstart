import React from "react";
import { usePlaidLink } from "react-plaid-link";

interface Props {
  setLinkSuccess: (arg: boolean) => void;
  setItemId: (arg: string) => void;
  setAccessToken: (arg: string) => void;
}

const OauthLink: React.FC<Props> = (props: Props) => {
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
      window.location.href = "http://localhost:3000";
    };
    getToken();

    props.setLinkSuccess(true);
  }, []);

  const linkToken: string = localStorage.getItem("link_token")!;
  console.log("fetch", linkToken);
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken,
    receivedRedirectUri: window.location.href,
    onSuccess,
    clientName: "hello world",
    env: "sandbox",
    product: ["auth"],
  };

  const { open, ready, error } = usePlaidLink(config);
  console.log("second Link:", window.location.href);

  React.useEffect(() => {
    if (!ready) {
      return;
    }
    open();
  }, [ready, open]);

  return <></>;
};

OauthLink.displayName = "OauthLink";

export default OauthLink;
