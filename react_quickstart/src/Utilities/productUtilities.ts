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

export interface DataItem {
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
  status_code?: number;
  mask?: string;
  subtype?: string;
  quantity?: number;
  price?: number;
  value?: number;
  type?: string;
}

export interface ACH {
  account: string;
  routing: string;
  account_id: string;
}

export type Data = Array<DataItem>;

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
  // const final: Array<DataItem> = [];
  return data.transactions?.map((t) => {
    const item: DataItem = {
      name: t.name,
      amount: t.amount,
      date: t.date,
    };
    return item;
  }) as Array<DataItem>;
};

export const transformAuthData = (data: AuthGetResponse) => {
  return data.numbers!.ach!.map((achNumbers) => {
    const account = data.accounts!.filter((a) => {
      return a.account_id === achNumbers.account_id;
    })[0];
    return {
      name: account.name,
      balance: account.balances.available || account.balances.current,
      account: achNumbers.account,
      routing: achNumbers.routing,
    };
  });
};

export const transformIdentityData = (data: IdentityGetResponse) => {
  const final: Array<DataItem> = [];
  const identityData = data.accounts![0];
  identityData.owners!.forEach((owner) => {
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

    const num = Math.max(
      emails!.length,
      names!.length,
      phone!.length,
      addresses!.length
    );

    for (let i = 0; i < num; i++) {
      const obj = {
        names: names![i] || "",
        emails: emails![i] || "",
        phoneNumbers: phone![i] || "",
        addresses: addresses![i] || "",
      };
      final.push(obj);
    }
  });

  return final;
};

export const transformBalanceData = (data: AccountsGetResponse) => {
  const balanceData = data.accounts;
  return balanceData!.map((account) => {
    const obj: DataItem = {
      name: account.name,
      balance: account.balances.available || account.balances.current,
      subtype: account.subtype,
      mask: account.mask!,
    };

    return obj;
  });
};

export const transformInvestmentsData = (
  data: InvestmentsHoldingsGetResponse
) => {
  const final: Array<DataItem> = [];
  const holdingsData = data.holdings!.sort(function (a, b) {
    if (a.account_id! > b.account_id!) return 1;
    return -1;
  });
  return holdingsData.map((holding) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === holding.account_id
    )[0];
    const security = data.securities!.filter(
      (sec) => sec.security_id === holding.security_id
    )[0];
    const value = holding.quantity! * security.close_price!;

    return {
      mask: account.mask!,
      name: account.name,
      quantity: holding.quantity,
      price: security.close_price!,
      value: value,
    };
  });
};

export const transformLiabilitiesData = (data: LiabilitiesGetResponse) => {
  const final: Array<DataItem> = [];
  const liabilitiesData = data.liabilities;
  const credit = liabilitiesData?.credit?.map((credit) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === credit.account_id
    )[0];
    const obj: DataItem = {
      name: account.name,
      type: "credit card",
      date: credit.last_payment_date!,
      amount: credit.last_payment_amount,
    };
    return obj;
  });

  const mortgages = liabilitiesData?.mortgage?.map((mortgage) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === mortgage.account_id
    )[0];
    const obj: DataItem = {
      name: account.name,
      type: "mortgage",
      date: mortgage.last_payment_date!,
      amount: mortgage.last_payment_amount!,
    };
    return obj;
  });

  const student = liabilitiesData?.student?.map((student) => {
    const account = data.accounts!.filter(
      (acc) => acc.account_id === student.account_id
    )[0];
    const obj: DataItem = {
      name: account.name,
      type: "student loan",
      date: student.last_payment_date!,
      amount: student.last_payment_amount!,
    };
    return obj;
  });

  return credit!.concat(mortgages!).concat(student!);
};

interface ItemData {
  itemResponse: ItemGetResponse;
  instRes: InstitutionsGetByIdResponse;
}

export const transformItemData = (data: ItemData) => {
  return [
    {
      name: data.instRes.institution!.name,
      billed: data.itemResponse.item?.billed_products?.join(","),
      available: data.itemResponse.item?.available_products?.join(","),
    },
  ];
};

export const transformAccountsData = (data: AccountsGetResponse) => {
  const final: Array<DataItem> = [];
  const accountsData = data.accounts;
  return accountsData!.map((account) => {
    const obj: DataItem = {
      name: account.name,
      balance: account.balances.available || account.balances.current,
      subtype: account.subtype,
      mask: account.mask!,
    };
    return obj;
  });
};
