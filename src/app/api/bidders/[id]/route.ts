import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

// ✅ GET bidder by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid bidder ID" },
        { status: 400 }
      );
    }
    const bidder = await prisma.user.findUnique({
      where: { id, role: "bidder" },
    });

    if (!bidder) {
      return NextResponse.json(
        { error: "Bidder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bidder);
  } catch (error: any) {
    console.error("Error fetching bidder:", error);
    return NextResponse.json(
      { error: "Failed to fetch bidder", details: error?.message },
      { status: 500 }
    );
  }
}

// ✅ PUT update bidder by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid bidder ID" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { name, email, phone, county } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if bidder exists
    const existingBidder = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingBidder || existingBidder.role !== "bidder") {
      return NextResponse.json(
        { error: "Bidder not found" },
        { status: 404 }
      );
    }

    // Update bidder
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        county: county?.trim() || null,
      },
    });

    // Log audit (non-blocking)
    logAction("UPDATE", "Bidder", id, "Admin User", "admin", null).catch(() => {});

    // Create notification (non-blocking)
    createNotification(`Bidder "${updated.name}" was updated`, "Info").catch(() => {});

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating bidder:", error);
    
    let errorMessage = "Failed to update bidder";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "Bidder not found";
      statusCode = 404;
    } else if (error?.code === "P2002") {
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

// ✅ DELETE bidder by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid bidder ID" },
        { status: 400 }
      );
    }

    // Check if bidder exists
    const existingBidder = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingBidder || existingBidder.role !== "bidder") {
      return NextResponse.json(
        { error: "Bidder not found" },
        { status: 404 }
      );
    }

    const bidderName = existingBidder.name;

    // Delete bidder
    await prisma.user.delete({
      where: { id },
    });

    // Log audit (non-blocking)
    logAction("DELETE", "Bidder", id, "Admin User", "admin", null).catch(() => {});

    // Create notification (non-blocking)
    createNotification(`Bidder "${bidderName}" was deleted`, "Warning").catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bidder:", error);
    
    let errorMessage = "Failed to delete bidder";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "Bidder not found";
      statusCode = 404;
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
