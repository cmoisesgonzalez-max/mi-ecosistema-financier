import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.COOKIE_SECRET || "fallback-secret");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/?error=upwork_auth_failed`);
  }

  try {
    const tokenRes = await fetch("https://www.upwork.com/api/v3/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.UPWORK_CLIENT_ID,
        client_secret: process.env.UPWORK_CLIENT_SECRET,
        redirect_uri: APP_URL + "/api/upwork/callback",
      }),
    });

    if (!tokenRes.ok) throw new Error("Token request failed");
    const tokenData = await tokenRes.json();

    const jwt = await new SignJWT({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("90d")
      .sign(secret);

    cookies().set("upwork_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });

    return NextResponse.redirect(`${APP_URL}/?connected=upwork`);
  } catch (err) {
    console.error("Upwork callback error:", err.message);
    return NextResponse.redirect(`${APP_URL}/?error=upwork_token_failed`);
  }
}
