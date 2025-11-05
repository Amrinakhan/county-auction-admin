import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

// ✅ GET all properties
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        bidder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// ✅ POST new property
export async function POST(request: Request) {
  try {
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

    const newProperty = await prisma.property.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        county: county.trim(),
        price: parseFloat(price),
        status: status || "available",
        bidderId: bidderId ? Number(bidderId) : null,
      },
    });

    // Create audit log with detailed description
    const auditDescription = `Property "${newProperty.name}" created successfully${bidderId ? ` and assigned to bidder` : ""}`;
    logAction("CREATE", "Property", newProperty.id, "Admin User", "admin", auditDescription).catch(() => {});

    // Create notification
    const notificationTitle = `New property "${newProperty.name}" added`;
    createNotification(notificationTitle, "property").catch(() => {});

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error: any) {
    console.error("Error creating property:", error);
    
    let errorMessage = "Failed to create property";
    let statusCode = 500;
    
    if (error?.code === "P2002") {
      errorMessage = "A property with this information already exists";
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

// ✅ PUT update property
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, location, county, price, status, bidderId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing property ID" },
        { status: 400 }
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
      where: { id: Number(id) },
      data: {
        name: name?.trim(),
        location: location?.trim(),
        county: county?.trim(),
        price: price ? parseFloat(price) : undefined,
        status: status || "available",
        bidderId: bidderId !== undefined ? (bidderId ? Number(bidderId) : null) : undefined,
      },
    });

    // Create audit log with detailed description
    const auditDescription = `Property "${updated.name}" updated successfully${bidderId ? ` and assigned to bidder` : bidderId === null ? ` and bidder assignment removed` : ""}`;
    logAction("UPDATE", "Property", Number(id), "Admin User", "admin", auditDescription).catch(() => {});

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

// ✅ DELETE property
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing property ID" },
        { status: 400 }
      );
    }

    // Get property details before deletion for audit log
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    await prisma.property.delete({
      where: { id: Number(id) },
    });

    // Create audit log with detailed description
    const auditDescription = `Property "${property.name}" deleted successfully`;
    logAction("DELETE", "Property", Number(id), "Admin User", "admin", auditDescription).catch(() => {});

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
