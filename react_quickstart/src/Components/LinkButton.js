import React from "react";
import { PlaidLink } from "react-plaid-link";
import axios from "axios";

const LinkButton = (props) => {
  const onSuccess = (token, metadata) => {
    axios.post(
      "/api/set_access_token",
      {
        public_token: token,
      },
      function (data) {}
    );
  };

  return (
    <div className="ConnectBtn">
      <PlaidLink token={props.token} onSuccess={onSuccess}>
        Launch Link
      </PlaidLink>
    </div>
  );
};
export default LinkButton;
