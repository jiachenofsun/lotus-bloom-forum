import { NextResponse } from "next/server";
import { addReaction, removeReaction } from "@/app/actions/db-actions";
import { getSession } from "@auth0/nextjs-auth0";

export async function POST(req) {
  const session = await getSession();
  const { post_id } = await req.json();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await addReaction(post_id, session.user.sub);
  return NextResponse.json(result);
}

export async function DELETE(req) {
  const session = await getSession();
  const { post_id } = await req.json();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await removeReaction(post_id, session.user.sub);
  return NextResponse.json(result);
}
