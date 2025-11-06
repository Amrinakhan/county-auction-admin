import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

function validateEmail(email: unknown) {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : null;
    const email = validateEmail(body?.email);

    if (!name && !email) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    if (email) {
      const emailOwner = await prisma.userLogin.findUnique({ where: { email } });
      if (emailOwner && emailOwner.id !== sessionUser.id) {
        return NextResponse.json({ error: "Email address is already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.userLogin.update({
      where: { id: sessionUser.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Profile update error", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

