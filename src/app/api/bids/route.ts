import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

// GET: fetch all bids with property + bidder
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get("auctionId");

    const where: any = {};
    if (auctionId) {
      where.auctionId = Number(auctionId);
    }

    const bids = await prisma.bid.findMany({
      where,
      include: {
        property: {
          select: {
            name: true,
            county: true,
            location: true,
          },
        },
        auction: {
          select: {
            id: true,
            status: true,
            start_date: true,
            end_date: true,
          },
        },
        bidder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

// POST: add a new bid
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🔵 POST /api/bids - Request body:", body);
    const { amount, propertyId, bidderId, auctionId } = body;

    if (!amount || !propertyId || !bidderId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, propertyId, and bidderId are required" },
        { status: 400 }
      );
    }

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: Number(propertyId) },
    });

    if (!property) {
      console.error("❌ Property not found:", propertyId);
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Validate bidder exists
    const bidder = await prisma.user.findUnique({
      where: { id: Number(bidderId) },
    });

    if (!bidder || bidder.role !== "bidder") {
      console.error("❌ Bidder not found or invalid:", bidderId);
      return NextResponse.json(
        { error: "Bidder not found or invalid" },
        { status: 404 }
      );
    }

    // If auctionId not provided but propertyId is, try to find active auction for that property
    let finalAuctionId = auctionId ? Number(auctionId) : null;
    
    if (!finalAuctionId && propertyId) {
      const activeAuction = await prisma.auction.findFirst({
        where: {
          propertyId: Number(propertyId),
          status: "ACTIVE",
          end_date: { gt: new Date() },
        },
        orderBy: { created_at: "desc" },
      });
      
      if (activeAuction) {
        finalAuctionId = activeAuction.id;
      }
    }

    // Validate auction if we have one
    if (finalAuctionId) {
      const auction = await prisma.auction.findUnique({
        where: { id: finalAuctionId },
      });

      if (!auction) {
        return NextResponse.json(
          { error: "Auction not found" },
          { status: 404 }
        );
      }

      // Check if auction is active
      if (auction.status !== "ACTIVE") {
        return NextResponse.json(
          { error: `Cannot place bid on ${auction.status.toLowerCase()} auction` },
          { status: 400 }
        );
      }

      // Check if auction has ended
      const now = new Date();
      if (auction.end_date <= now) {
        return NextResponse.json(
          { error: "Auction has ended" },
          { status: 400 }
        );
      }
    }

    console.log("✅ Validation passed, creating bid...");
    const bidData = {
      amount: parseFloat(amount),
      propertyId: Number(propertyId),
      bidderId: Number(bidderId),
      auctionId: finalAuctionId,
      status: "pending",
    };
    console.log("📦 Bid data:", bidData);

    const bid = await prisma.bid.create({
      data: bidData,
      include: {
        property: {
          select: {
            name: true,
            county: true,
          },
        },
        auction: {
          select: {
            id: true,
            status: true,
          },
        },
        bidder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Bid created successfully:", bid.id);

    // Log audit (non-blocking)
    await logAction(
      "CREATE",
      "Bid",
      bid.id,
      "Admin User",
      "admin",
      `Bid of $${bid.amount} placed on property "${bid.property.name}"`
    ).catch(() => {});

    // Create notification for admin
    await createNotification(
      `New bid $${bid.amount} by ${bid.bidder.name} on ${bid.property.name}`,
      "bid"
    ).catch(() => {});

    return NextResponse.json(bid, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating bid:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    
    let errorMessage = "Failed to create bid";
    let statusCode = 500;
    
    if (error?.code === "P2003") {
      errorMessage = "Invalid property or bidder ID";
      statusCode = 400;
    } else if (error?.code === "P2011") {
      errorMessage = "Database constraint violation. Please check that all required fields are provided.";
      statusCode = 400;
    } else if (error?.code === "P2002") {
      errorMessage = "A bid with this information already exists";
      statusCode = 400;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error?.message || "Unknown error",
        code: error?.code,
        meta: error?.meta
      },
      { status: statusCode }
    );
  }
}

// PATCH: update bid status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, approved, or rejected" },
        { status: 400 }
      );
    }

    const bidBeforeUpdate = await prisma.bid.findUnique({
      where: { id: Number(id) },
      include: {
        property: { select: { name: true } },
        bidder: { select: { name: true, email: true } },
      },
    });

    if (!bidBeforeUpdate) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.bid.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        property: {
          select: {
            name: true,
            county: true,
          },
        },
        bidder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await logAction(
      "UPDATE",
      "Bid",
      Number(id),
      "Admin User",
      "admin",
      `Bid ${id} status updated to ${status} for property "${updated.property.name}"`
    ).catch(() => {});

    // Create notification for bidder and admin
    const notificationMessage = status === "approved"
      ? `Your bid of $${updated.amount} on ${updated.property.name} has been approved!`
      : status === "rejected"
      ? `Your bid of $${updated.amount} on ${updated.property.name} has been rejected.`
      : `Bid status updated to ${status}`;

    await createNotification(
      notificationMessage,
      "bid"
    ).catch(() => {});

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating bid:", error);
    
    let errorMessage = "Failed to update bid";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "Bid not found";
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

// DELETE: remove a bid
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing bid ID" },
        { status: 400 }
      );
    }

    // Get bid details before deletion for audit log
    const bid = await prisma.bid.findUnique({
      where: { id: Number(id) },
      include: {
        property: { select: { name: true } },
        bidder: { select: { name: true } },
      },
    });

    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    await prisma.bid.delete({
      where: { id: Number(id) },
    });

    // Create audit log
    await logAction(
      "DELETE",
      "Bid",
      Number(id),
      "Admin User",
      "admin",
      `Bid ${id} ($${bid.amount}) deleted for property "${bid.property.name}"`
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bid:", error);
    
    let errorMessage = "Failed to delete bid";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "Bid not found";
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
