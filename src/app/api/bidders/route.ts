import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

export async function GET() {
  try {
    const bidders = await prisma.user.findMany({
      where: {
        role: "bidder",
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return NextResponse.json(bidders);
  } catch (error) {
    console.error("Error fetching bidders:", error);
    return NextResponse.json(
      { error: "Failed to fetch bidders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("🔵 POST /api/bidders - Request received");
  
  try {
    const body = await request.json();
    console.log("📦 Request body:", body);
    const { name, email, phone, county } = body;

    // Validate required fields
    if (!name || !email) {
      console.error("❌ Validation failed: name or email missing");
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed, creating bidder...");
    const bidder = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        county: county?.trim() || null,
        role: "bidder",
        status: "active",
      },
    });
    console.log("✅ Bidder created successfully:", bidder.id);

    // Log audit (non-blocking - never throws)
    logAction("CREATE", "Bidder", bidder.id, "Admin User", "admin", null).catch(() => {
      // Already handled in logAction, but catch just in case
    });

    // Create notification (non-blocking)
    createNotification(`New bidder "${bidder.name}" was added`, "Info").catch(() => {
      // Already handled in createNotification
    });

    console.log("✅ Returning success response");
    return NextResponse.json(bidder, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating bidder:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    
    // Handle specific Prisma errors
    let errorMessage = "Failed to create bidder";
    let statusCode = 500;
    
    if (error?.code === "P2002") {
      // Unique constraint violation
      errorMessage = "A bidder with this email already exists";
      statusCode = 400;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error?.message || "Unknown error",
        code: error?.code
      },
      { status: statusCode }
    );
  }
}

