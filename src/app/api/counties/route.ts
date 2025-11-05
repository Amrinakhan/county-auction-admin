import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

export async function GET() {
  try {
    const counties = await prisma.county.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    return NextResponse.json(counties);
  } catch (error) {
    console.error("Error fetching counties:", error);
    return NextResponse.json(
      { error: "Failed to fetch counties" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, state, visible } = body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "County name is required" },
        { status: 400 }
      );
    }

    const county = await prisma.county.create({
      data: {
        name: name.trim(),
        state: state?.trim() || null,
        visible: visible !== undefined ? visible : true,
      },
    });

    // Create audit log
    await logAction(
      "CREATE",
      "County",
      county.id,
      "Admin User",
      "admin",
      `County "${county.name}" created successfully`
    ).catch(() => {});

    // Create notification
    await createNotification(
      `New county "${county.name}" was added`,
      "county"
    ).catch(() => {});

    return NextResponse.json(county, { status: 201 });
  } catch (error: any) {
    console.error("Error creating county:", error);
    
    // Handle specific Prisma errors
    let errorMessage = "Failed to create county";
    let statusCode = 500;
    
    if (error?.code === "P2002") {
      errorMessage = "A county with this name already exists";
      statusCode = 400;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.message },
      { status: statusCode }
    );
  }
}

