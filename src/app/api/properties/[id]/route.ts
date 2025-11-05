import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

// ✅ PUT update property by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15/16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const idString = resolvedParams.id;
    
    if (!idString) {
      return NextResponse.json(
        { error: "Missing property ID in URL" },
        { status: 400 }
      );
    }
    
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, location, county, price, status, bidderId } = body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (!location || location.trim() === "") {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }
    if (!county || county.trim() === "") {
      return NextResponse.json(
        { error: "County is required" },
        { status: 400 }
      );
    }
    if (!price || isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Validate bidder if provided
    if (bidderId) {
      const bidder = await prisma.user.findUnique({
        where: { id: Number(bidderId) },
      });
      if (!bidder || bidder.role !== "bidder") {
        return NextResponse.json(
          { error: "Invalid bidder ID" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        name: name.trim(),
        location: location.trim(),
        county: county.trim(),
        price: parseFloat(price),
        status: status || "available",
        bidderId: bidderId !== undefined ? (bidderId ? Number(bidderId) : null) : undefined,
      },
    });

    // Create audit log with detailed description
    const auditDescription = `Property "${updated.name}" updated successfully${bidderId ? ` and assigned to bidder` : bidderId === null ? ` and bidder assignment removed` : ""}`;
    logAction("UPDATE", "Property", id, "Admin User", "admin", auditDescription).catch(() => {});

    // Create notification
    const notificationTitle = `Property "${updated.name}" was updated`;
    createNotification(notificationTitle, "property").catch(() => {});

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating property:", error);
    
    let errorMessage = "Failed to update property";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "Property not found";
      statusCode = 404;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.message },
      { status: statusCode }
    );
  }
}

// ✅ DELETE property by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15/16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const idString = resolvedParams.id;
    
    if (!idString) {
      return NextResponse.json(
        { error: "Missing property ID in URL" },
        { status: 400 }
      );
    }
    
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    // Get property details before deletion for audit log
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    await prisma.property.delete({
      where: { id },
    });

    // Create audit log with detailed description
    const auditDescription = `Property "${property.name}" deleted successfully`;
    logAction("DELETE", "Property", id, "Admin User", "admin", auditDescription).catch(() => {});

    // Create notification
    const notificationTitle = `Property "${property.name}" was deleted`;
    createNotification(notificationTitle, "property").catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting property:", error);
    
    let errorMessage = "Failed to delete property";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "Property not found";
      statusCode = 404;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.message },
      { status: statusCode }
    );
  }
}
