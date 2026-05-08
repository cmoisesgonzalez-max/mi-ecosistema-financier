const UPWORK_BASE = "https://www.upwork.com";
const UPWORK_API = "https://api.upwork.com/graphql";

export function getUpworkAuthUrl(state) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.UPWORK_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_APP_URL + "/api/upwork/callback",
    state,
  });
  return `${UPWORK_BASE}/services/api/auth?${params}`;
}

export async function exchangeUpworkCode(code) {
  const res = await fetch(`${UPWORK_BASE}/api/v3/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.UPWORK_CLIENT_ID,
      client_secret: process.env.UPWORK_CLIENT_SECRET,
      redirect_uri: process.env.NEXT_PUBLIC_APP_URL + "/api/upwork/callback",
    }),
  });
  if (!res.ok) throw new Error("Upwork token exchange failed");
  return res.json();
}

export async function refreshUpworkToken(refreshToken) {
  const res = await fetch(`${UPWORK_BASE}/api/v3/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.UPWORK_CLIENT_ID,
      client_secret: process.env.UPWORK_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error("Upwork token refresh failed");
  return res.json();
}
