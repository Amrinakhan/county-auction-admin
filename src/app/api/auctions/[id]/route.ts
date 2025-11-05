import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

// ✅ GET auction by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid auction ID" },
        { status: 400 }
      );
    }

    const auction = await prisma.auction.findUnique({
      where: { id },
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
          include: {
            bidder: {
              select: {
                id: true,
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
    });

    if (!auction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction" },
      { status: 500 }
    );
  }
}

// ✅ PUT update auction
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid auction ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { start_date, end_date, status } = body;

    // Check if auction exists
    const existingAuction = await prisma.auction.findUnique({
      where: { id },
    });

    if (!existingAuction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    // Validate dates if provided
    let startDate = existingAuction.start_date;
    let endDate = existingAuction.end_date;

    if (start_date) {
      startDate = new Date(start_date);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date format" },
          { status: 400 }
        );
      }
    }

    if (end_date) {
      endDate = new Date(end_date);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date format" },
          { status: 400 }
        );
      }
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Determine status based on dates if not explicitly provided
    let auctionStatus = status || existingAuction.status;
    const now = new Date();
    if (startDate <= now && endDate > now) {
      auctionStatus = "ACTIVE";
    } else if (endDate <= now) {
      auctionStatus = "ENDED";
    }

    const updated = await prisma.auction.update({
      where: { id },
      data: {
        start_date: startDate,
        end_date: endDate,
        status: auctionStatus,
      },
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create audit log
    await logAction(
      "UPDATE",
      "Auction",
      id,
      "Admin User",
      "admin",
      `Auction updated for property "${updated.property.name}"`
    ).catch(() => {});

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating auction:", error);

    let errorMessage = "Failed to update auction";
    let statusCode = 500;

    if (error?.code === "P2025") {
      errorMessage = "Auction not found";
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

// ✅ DELETE auction
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid auction ID" },
        { status: 400 }
      );
    }

    // Get auction details before deletion for audit log
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            name: true,
          },
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
      where: { id },
    });

    // Create audit log
    await logAction(
      "DELETE",
      "Auction",
      id,
      "Admin User",
      "admin",
      `Auction deleted for property "${auction.property.name}"`
    ).catch(() => {});

    // Create notification
    await createNotification(
      `Auction for property "${auction.property.name}" was deleted`,
      "auction"
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting auction:", error);

    let errorMessage = "Failed to delete auction";
    let statusCode = 500;

    if (error?.code === "P2025") {
      errorMessage = "Auction not found";
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

