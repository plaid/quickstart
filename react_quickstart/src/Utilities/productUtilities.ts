import React, { useEffect, useState } from "react";
import {
  AuthGetResponse,
  TransactionsGetResponse,
  IdentityGetResponse,
  InvestmentsHoldingsGetResponse,
  AccountsGetResponse,
  ItemGetResponse,
  InstitutionsGetByIdResponse,
  LiabilitiesGetResponse,
} from "plaid/generated-code/api";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export interface Categories {
  title: string;
  field: string;
}

export interface DataItems {
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  amount?: number;
  date?: string;
  balance?: number;
  accounts?: string;
  router?: string;
  account?: string;
  numbers?: Array<ACH>;
  emails?: string;
  addresses?: string;
  phoneNumbers?: string;
  error_type?: string;
  error_code?: string;
  error_message?: string;
  display_message?: string | null;
}

export interface ACH {
  account: string;
  routing: string;
  account_id: string;
}

export type Data = Array<DataItems>;

export const transactionsCategories: Array<Categories> = [
  {
    title: "Name",
    field: "name",
  },
  {
    title: "Amount",
    field: "amount",
  },
  {
    title: "Date",
    field: "date",
  },
];

export const authCategories: Array<Categories> = [
  {
    title: "Name",
    field: "name",
  },
  {
    title: "Balance",
    field: "balance",
  },
  {
    title: "Account #",
    field: "account",
  },
  {
    title: "Routing #",
    field: "routing",
  },
];

export const identityCategories: Array<Categories> = [
  {
    title: "Names",
    field: "names",
  },
  {
    title: "Emails",
    field: "emails",
  },
  {
    title: "Phone numbers",
    field: "phoneNumbers",
  },
  {
    title: "Addresses",
    field: "addresses",
  },
];

export const balanceCategories: Array<Categories> = [
  {
    title: "Name",
    field: "name",
  },
  {
    title: "Balance",
    field: "balance",
  },
  {
    title: "Subtype",
    field: "subtype",
  },
  {
    title: "Mask",
    field: "mask",
  },
];

export const investmentsCategories: Array<Categories> = [
  {
    title: "Account Mask",
    field: "mask",
  },
  {
    title: "Name",
    field: "name",
  },
  {
    title: "Quantity",
    field: "quantity",
  },
  {
    title: "Close Price",
    field: "price",
  },
  {
    title: "Value",
    field: "value",
  },
];

export const liabilitiesCategories: Array<Categories> = [
  {
    title: "Name",
    field: "name",
  },
  {
    title: "Type",
    field: "type",
  },
  {
    title: "Last Payment Date",
    field: "date",
  },
  {
    title: "Last Payment Amount",
    field: "amount",
  },
];

export const itemCategories: Array<Categories> = [
  {
    title: "Institution Name",
    field: "name",
  },
  {
    title: "Billed Products",
    field: "billed",
  },
  {
    title: "Available Products",
    field: "available",
  },
];

export const accountsCategories: Array<Categories> = [
  {
    title: "Name",
    field: "name",
  },
  {
    title: "Balance",
    field: "balance",
  },
  {
    title: "Subtype",
    field: "subtype",
  },
  {
    title: "Mask",
    field: "mask",
  },
];

export const transformTransactionsData = (data: TransactionsGetResponse) => {
  return data.transactions;
};

export const transformAuthData = (data: AuthGetResponse) => {
  const final: Array<DataItems> = [];
  data.numbers!.ach!.forEach((achNumbers) => {
    const account = data.accounts!.filter((a) => {
      return a.account_id === achNumbers.account_id;
    })[0];
    const obj = {
      name: account.name,
      balance: account.balances.available || account.balances.current,
      account: achNumbers.account,
      routing: achNumbers.routing,
    };
    final.push(obj);
  });
  return final;
};

export const transformIdentityData = (data: IdentityGetResponse) => {
  const final: Array<DataItems> = [];
  const identityData = data.accounts![0];
  const owner = identityData.owners![0];
  const names = owner.names?.map((name) => {
    return name;
  });
  const emails = owner.emails?.map((email) => {
    return email.data;
  });
  const phone = owner.phone_numbers?.map((phone) => {
    return phone.data;
  });
  const addresses = owner.addresses?.map((address) => {
    return `${address.data!.street} ${address.data!.city} ${
      address.data!.region
    } ${address.data!.postal_code}`;
  });
  const obj = {
    names: names?.join(","),
    emails: `${emails![0]},
    ${emails![1]},
    ${emails![2]}`,

    phoneNumbers: `${phone![0]}
    ${phone![1]}
    ${phone![2]}`,
    addresses: `${addresses![0]}, 
    ${addresses![1]}`,
  };
  final.push(obj);

  return final;
};

export const transformBalanceData = (data: AccountsGetResponse) => {
  const final: Array<DataItems> = [];
  const balanceData = data.accounts;
  balanceData!.forEach((account) => {
    const obj = {
      name: account.name,
      balance: account.balances.available || account.balances.current,
      subtype: account.subtype,
      mask: account.mask,
    };
    final.push(obj);
  });
  return final;
};

export const transformInvestmentsData = (
  data: InvestmentsHoldingsGetResponse
) => {
  const final: Array<DataItems> = [];
  const holdingsData = data.holdings!.sort(function (a, b) {
    if (a.account_id! > b.account_id!) return 1;
    return -1;
  });
  console.log("holdingsdata", holdingsData);
  holdingsData.forEach((holding, index) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === holding.account_id
    )[0];
    const security = data.securities!.filter(
      (sec) => sec.security_id === holding.security_id
    )[0];
    const value = holding.quantity! * security.close_price!;

    const obj = {
      mask: account.mask,
      name: account.name,
      quantity: holding.quantity,
      price: security.close_price,
      value: value,
    };
    final.push(obj);
  });
  return final;
};

export const transformLiabilitiesData = (data: LiabilitiesGetResponse) => {
  const final: Array<DataItems> = [];
  const liabilitiesData = data.liabilities;
  liabilitiesData?.credit?.forEach((credit) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === credit.account_id
    )[0];
    const obj = {
      name: account.name,
      type: "credit card",
      date: credit.last_payment_date,
      amount: credit.last_payment_amount,
    };
    final.push(obj);
  });

  liabilitiesData?.mortgage?.forEach((mortgage) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === mortgage.account_id
    )[0];
    const obj = {
      name: account.name,
      type: "mortgage",
      date: mortgage.last_payment_date!,
      amount: mortgage.last_payment_amount!,
    };
    final.push(obj);
  });

  liabilitiesData?.student?.forEach((student) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === student.account_id
    )[0];
    const obj = {
      name: account.name,
      type: "student loan",
      date: student.last_payment_date!,
      amount: student.last_payment_amount!,
    };
    final.push(obj);
  });

  return final;
};

export const transformItemData = (
  itemResp: ItemGetResponse,
  instResp: InstitutionsGetByIdResponse
) => {
  const final: Array<DataItems> = [];

  const obj = {
    name: instResp.institution!.name,
    billed: itemResp.item?.billed_products?.join(","),
    available: itemResp.item?.available_products?.join(","),
  };
  final.push(obj);

  return final;
};

export const transformAccountsData = (data: AccountsGetResponse) => {
  const final: Array<DataItems> = [];
  const accountsData = data.accounts;
  accountsData!.forEach((account) => {
    const obj = {
      name: account.name,
      balance: account.balances.available || account.balances.current,
      subtype: account.subtype,
      mask: account.mask,
    };
    final.push(obj);
  });
  return final;
};
