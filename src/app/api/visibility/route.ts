import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const controls = await prisma.visibilityControl.findMany({
      include: {
        county: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        field_name: "asc",
      },
    });
    return NextResponse.json(controls || []);
  } catch (error) {
    console.error("Error fetching visibility controls:", error);
    // Return empty array on error instead of error object
    return NextResponse.json([]);
  }
}

