import {
  AuthGetResponse,
  TransactionsGetResponse,
  IdentityGetResponse,
  InvestmentsHoldingsGetResponse,
  AccountsGetResponse,
  ItemGetResponse,
  InstitutionsGetByIdResponse,
  LiabilitiesGetResponse,
  PaymentInitiationPaymentGetResponse,
  AssetReportGetResponse,
  AssetReport,
} from "plaid/dist/api";

const formatter = new Intl.NumberFormat("en-US", {
  //should look like "$50" or "$50.34"
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export interface Categories {
  title: string;
  field: string;
}

//interfaces for categories in each individual product
interface AuthDataItem {
  routing: string;
  account: string;
  balance: string;
  name: string;
}
interface TransactionsDataItem {
  amount: string;
  date: string;
  name: string;
}

interface IdentityDataItem {
  addresses: string;
  phoneNumbers: string;
  emails: string;
  names: string;
}

interface BalanceDataItem {
  balance: string;
  subtype: string | null;
  mask: string;
  name: string;
}

interface InvestmentsDataItem {
  mask: string;
  quantity: number;
  price: string;
  value: string;
  name: string;
}

interface LiabilitiessDataItem {
  amount: string;
  date: string;
  name: string;
  type: string;
}

interface PaymentDataItem {
  paymentId: string;
  amount: string;
  status: string;
  statusUpdate: string;
  recipientId: string;
}
interface ItemDataItem {
  billed: string;
  available: string;
  name: string;
}

interface AssetsDataItem {
  account: string;
  balance: string;
  transactions: number;
  daysAvailable: number;
}

export interface ErrorDataItem {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
  status_code: number | null;
}

//all possible product data interfaces
export type DataItem =
  | AuthDataItem
  | TransactionsDataItem
  | IdentityDataItem
  | BalanceDataItem
  | InvestmentsDataItem
  | LiabilitiessDataItem
  | ItemDataItem
  | PaymentDataItem
  | AssetsDataItem;

export type Data = Array<DataItem>;

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

export const paymentCategories: Array<Categories> = [
  {
    title: "Payment ID",
    field: "paymentId",
  },
  {
    title: "Amount",
    field: "amount",
  },
  {
    title: "Status",
    field: "status",
  },
  {
    title: "Status Update",
    field: "statusUpdate",
  },
  {
    title: "Recipient ID",
    field: "recipientId",
  },
];

export const assetsCategories: Array<Categories> = [
  {
    title: "Account",
    field: "account",
  },
  {
    title: "Transactions",
    field: "transactions",
  },
  {
    title: "Balance",
    field: "balance",
  },
  {
    title: "Days Available",
    field: "daysAvailable",
  },
];

export const transformAuthData = (data: AuthGetResponse) => {
  return data.numbers.ach!.map((achNumbers) => {
    const account = data.accounts!.filter((a) => {
      return a.account_id === achNumbers.account_id;
    })[0];
    const obj: DataItem = {
      name: account.name,
      balance:
        formatter.format(account.balances.available!) ||
        formatter.format(account.balances.current!),
      account: achNumbers.account!,
      routing: achNumbers.routing!,
    };
    return obj;
  });
};

export const transformTransactionsData = (
  data: TransactionsGetResponse
): Array<DataItem> => {
  return data.transactions!.map((t) => {
    const item: DataItem = {
      name: t.name!,
      amount: formatter.format(t.amount!),
      date: t.date,
    };
    return item;
  });
};

interface IdentityData {
  identity: IdentityGetResponse["accounts"];
}

export const transformIdentityData = (data: IdentityData) => {
  const final: Array<DataItem> = [];
  const identityData = data.identity![0];
  identityData.owners.forEach((owner) => {
    const names = owner.names.map((name) => {
      return name;
    });
    const emails = owner.emails.map((email) => {
      return email.data;
    });
    const phones = owner.phone_numbers.map((phone) => {
      return phone.data;
    });
    const addresses = owner.addresses.map((address) => {
      return `${address.data.street} ${address.data.city}, ${address.data.region} ${address.data.postal_code}`;
    });

    const num = Math.max(
      emails.length,
      names.length,
      phones.length,
      addresses.length
    );

    for (let i = 0; i < num; i++) {
      const obj = {
        names: names[i] || "",
        emails: emails[i] || "",
        phoneNumbers: phones[i] || "",
        addresses: addresses[i] || "",
      };
      final.push(obj);
    }
  });

  return final;
};

export const transformBalanceData = (data: AccountsGetResponse) => {
  const balanceData = data.accounts;
  return balanceData.map((account) => {
    const obj: DataItem = {
      name: account.name,
      balance:
        formatter.format(account.balances.available!) ||
        formatter.format(account.balances.current!),
      subtype: account.subtype,
      mask: account.mask!,
    };
    return obj;
  });
};

interface InvestmentData {
  error: null;
  holdings: InvestmentsHoldingsGetResponse;
}

export const transformInvestmentsData = (data: InvestmentData) => {
  const holdingsData = data.holdings.holdings!.sort(function (a, b) {
    if (a.account_id > b.account_id) return 1;
    return -1;
  });
  return holdingsData.map((holding) => {
    const account = data.holdings.accounts!.filter(
      (acc) => acc.account_id === holding.account_id
    )[0];
    const security = data.holdings.securities!.filter(
      (sec) => sec.security_id === holding.security_id
    )[0];
    const value = holding.quantity * security.close_price!;

    const obj: DataItem = {
      mask: account.mask!,
      name: security.name!,
      quantity: holding.quantity,
      price: formatter.format(security.close_price!),
      value: formatter.format(value),
    };
    return obj;
  });
};

export const transformLiabilitiesData = (data: LiabilitiesGetResponse) => {
  const liabilitiesData = data.liabilities;
  const credit = liabilitiesData.credit!.map((credit) => {
    const account = data.accounts.filter(
      (acc) => acc.account_id === credit.account_id
    )[0];
    const obj: DataItem = {
      name: account.name,
      type: "credit card",
      date: credit.last_payment_date,
      amount: formatter.format(credit.last_payment_amount),
    };
    return obj;
  });

  const mortgages = liabilitiesData.mortgage?.map((mortgage) => {
    const account = data.accounts.filter(
      (acc) => acc.account_id === mortgage.account_id
    )[0];
    const obj: DataItem = {
      name: account.name,
      type: "mortgage",
      date: mortgage.last_payment_date!,
      amount: formatter.format(mortgage.last_payment_amount!),
    };
    return obj;
  });

  const student = liabilitiesData.student?.map((student) => {
    const account = data.accounts.filter(
      (acc) => acc.account_id === student.account_id
    )[0];
    const obj: DataItem = {
      name: account.name,
      type: "student loan",
      date: student.last_payment_date!,
      amount: formatter.format(student.last_payment_amount!),
    };
    return obj;
  });

  return credit!.concat(mortgages!).concat(student!);
};

interface ItemData {
  item: ItemGetResponse["item"];
  institution: InstitutionsGetByIdResponse["institution"];
}

export const transformItemData = (data: ItemData): Array<DataItem> => {
  return [
    {
      name: data.institution.name,
      billed: data.item.billed_products.join(", "),
      available: data.item.available_products.join(", "),
    },
  ];
};

export const transformAccountsData = (data: AccountsGetResponse) => {
  const accountsData = data.accounts;
  return accountsData.map((account) => {
    const obj: DataItem = {
      name: account.name,
      balance:
        formatter.format(account.balances.available!) ||
        formatter.format(account.balances.current!),
      subtype: account.subtype,
      mask: account.mask!,
    };
    return obj;
  });
};

interface PaymentData {
  payment: PaymentInitiationPaymentGetResponse;
}

export const transformPaymentData = (data: PaymentData) => [
  {
    paymentId: data.payment.payment_id,
    amount: `${data.payment.amount.currency} ${data.payment.amount.value}`,
    status: data.payment.status,
    statusUpdate: data.payment.last_status_update
      .replace("T", " ")
      .replace("Z", ""),
    recipientId: data.payment.recipient_id,
  },
];

interface AssetResponseData {
  json: AssetReport;
}

export const transformAssetsData = (data: AssetResponseData) => {
  const assetItems = data.json.items;
  return assetItems.flatMap((item) => {
    return item.accounts.map((account) => {
      const obj: DataItem = {
        account: account.name,
        balance:
          formatter.format(account.balances.available!) ||
          formatter.format(account.balances.current!),
        transactions: account.transactions!.length,
        daysAvailable: account.days_available!,
      };
      return obj;
    });
  });
};
