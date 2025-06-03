import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: "client_credentials",
        }),
      },
    );

    const tokenData = await response.json();
    return NextResponse.json({ access_token: tokenData.access_token });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
