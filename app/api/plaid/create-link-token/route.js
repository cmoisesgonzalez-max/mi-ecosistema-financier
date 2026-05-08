import { NextResponse } from "next/server";
import { getPlaidClient } from "@/lib/plaid";

export async function POST() {
  try {
    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      return NextResponse.json({ error: "Plaid no configurado" }, { status: 500 });
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: "moises-gonzalez" },
      client_name: "Mi Ecosistema Financiero",
      products: ["transactions"],
      country_codes: ["US"],
      language: "es",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error("Plaid link token error:", err.message);
    return NextResponse.json({ error: "Error creando link token" }, { status: 500 });
  }
}
