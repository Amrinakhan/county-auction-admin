import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        created_at: "desc",
      },
      take: 100,
    });
    return NextResponse.json(logs || []);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    // Return empty array on error instead of error object
    return NextResponse.json([]);
  }
}

