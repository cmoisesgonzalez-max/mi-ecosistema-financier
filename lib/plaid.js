import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

let plaidClient = null;

export function getPlaidClient() {
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) return null;
  if (plaidClient) return plaidClient;
  const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  });
  plaidClient = new PlaidApi(config);
  return plaidClient;
}
