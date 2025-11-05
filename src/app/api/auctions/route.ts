import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

// ✅ GET all auctions
export async function GET() {
  try {
    const auctions = await prisma.auction.findMany({
      include: {
        property: {
          select: {
            id: true,
            name: true,
            location: true,
            county: true,
            price: true,
          },
        },
        bids: {
          select: {
            id: true,
            amount: true,
            bidder: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            amount: "desc",
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}

// ✅ POST create new auction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, start_date, end_date, status } = body;

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }
    if (!start_date) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      );
    }
    if (!end_date) {
      return NextResponse.json(
        { error: "End date is required" },
        { status: 400 }
      );
    }

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: Number(propertyId) },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Determine status based on dates if not provided
    let auctionStatus = status || "UPCOMING";
    const now = new Date();
    if (startDate <= now && endDate > now) {
      auctionStatus = "ACTIVE";
    } else if (endDate <= now) {
      auctionStatus = "ENDED";
    }

    const auction = await prisma.auction.create({
      data: {
        propertyId: Number(propertyId),
        start_date: startDate,
        end_date: endDate,
        status: auctionStatus,
      },
      include: {
        property: {
          select: {
            name: true,
            location: true,
            county: true,
          },
        },
      },
    });

    // Create audit log
    await logAction(
      "CREATE",
      "Auction",
      auction.id,
      "Admin User",
      "admin",
      `Auction created for property "${property.name}"`
    ).catch(() => {});

    // Create notification
    await createNotification(
      `New auction created for property "${property.name}"`,
      "auction"
    ).catch(() => {});

    return NextResponse.json(auction, { status: 201 });
  } catch (error: any) {
    console.error("Error creating auction:", error);

    let errorMessage = "Failed to create auction";
    let statusCode = 500;

    if (error?.code === "P2003") {
      errorMessage = "Invalid property ID";
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

// ✅ PATCH update auction status or dates
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, start_date, end_date } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Auction ID is required" },
        { status: 400 }
      );
    }

    const existingAuction = await prisma.auction.findUnique({
      where: { id: Number(id) },
      include: {
        property: {
          select: { name: true },
        },
      },
    });

    if (!existingAuction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.end_date = new Date(end_date);

    const updated = await prisma.auction.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        property: {
          select: { name: true },
        },
      },
    });

    // Create audit log
    await logAction(
      "UPDATE",
      "Auction",
      Number(id),
      "Admin User",
      "admin",
      `Auction ${id} updated for property "${updated.property.name}"`
    ).catch(() => {});

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating auction:", error);
    return NextResponse.json(
      { error: "Failed to update auction" },
      { status: 500 }
    );
  }
}

// ✅ DELETE auction
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Auction ID is required" },
        { status: 400 }
      );
    }

    const auction = await prisma.auction.findUnique({
      where: { id: Number(id) },
      include: {
        property: {
          select: { name: true },
        },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    await prisma.auction.delete({
      where: { id: Number(id) },
    });

    // Create audit log
    await logAction(
      "DELETE",
      "Auction",
      Number(id),
      "Admin User",
      "admin",
      `Auction ${id} deleted for property "${auction.property.name}"`
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting auction:", error);
    return NextResponse.json(
      { error: "Failed to delete auction" },
      { status: 500 }
    );
  }
}

