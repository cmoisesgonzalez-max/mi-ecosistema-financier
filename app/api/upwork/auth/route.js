import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.UPWORK_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_APP_URL + "/api/upwork/callback",
    state,
  });
  const url = `https://www.upwork.com/services/api/auth?${params}`;
  return NextResponse.json({ url });
}
