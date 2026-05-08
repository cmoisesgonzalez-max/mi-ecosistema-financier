import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPlaidClient } from "@/lib/plaid";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.COOKIE_SECRET || "fallback-secret");

export async function POST(request) {
  try {
    const { public_token, institution } = await request.json();
    const plaidClient = getPlaidClient();

    if (!plaidClient) {
      return NextResponse.json({ error: "Plaid no configurado" }, { status: 500 });
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    const jwt = await new SignJWT({ accessToken, itemId, institution })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const cookieStore = cookies();
    const existingTokens = cookieStore.get("plaid_tokens")?.value;
    let tokens = [];
    try {
      tokens = JSON.parse(existingTokens || "[]");
    } catch {}

    const idx = tokens.findIndex((t) => t.institution === institution);
    if (idx >= 0) tokens[idx] = { jwt, institution };
    else tokens.push({ jwt, institution });

    cookieStore.set("plaid_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({ success: true, institution });
  } catch (err) {
    console.error("Token exchange error:", err.message);
    return NextResponse.json({ error: "Error intercambiando token" }, { status: 500 });
  }
}
