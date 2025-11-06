import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { SESSION_COOKIE, getSessionCookieOptions, signSessionToken } from "@/lib/auth";

const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin123@gmail.com";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function ensureDefaultAdmin() {
  const existing = await prisma.userLogin.findUnique({
    where: { email: DEFAULT_ADMIN_EMAIL.toLowerCase() },
  });

  if (existing) {
    const passwordMatches = await bcrypt.compare(
      DEFAULT_ADMIN_PASSWORD,
      existing.password
    );

    if (!passwordMatches) {
      const updated = await prisma.userLogin.update({
        where: { id: existing.id },
        data: {
          password: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10),
          name: DEFAULT_ADMIN_NAME,
        },
      });
      return updated;
    }

    if (existing.name !== DEFAULT_ADMIN_NAME) {
      return prisma.userLogin.update({
        where: { id: existing.id },
        data: { name: DEFAULT_ADMIN_NAME },
      });
    }

    return existing;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  return prisma.userLogin.create({
    data: {
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
    },
  });
}

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();

    const body = await request.json();
    const email = body?.email?.toString().toLowerCase().trim();
    const password = body?.password?.toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.userLogin.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signSessionToken(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ error: "Unable to login" }, { status: 500 });
  }
}

