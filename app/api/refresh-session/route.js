import { getSession, updateSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get the current session from the request
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // For App Router, we need to use a different approach
    // Create a response that we'll modify
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Update the session in the cookies
    // Force update the same session (this will at least refresh cookie expiry)
    await updateSession(request, response, session);

    return response;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 },
    );
  }
}
