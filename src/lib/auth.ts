import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "./prisma";

const SESSION_COOKIE = "auction_session";

type SessionPayload = {
  userId: number;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Using fallback JWT secret. Set JWT_SECRET in production.");
      return "development-only-secret-change-me";
    }
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return secret;
}

export function signSessionToken(userId: number) {
  return jwt.sign({ userId } satisfies SessionPayload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as SessionPayload;

    const user = await prisma.userLogin.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };

