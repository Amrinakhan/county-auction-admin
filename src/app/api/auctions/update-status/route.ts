import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ POST/PATCH: Update auction statuses based on current date
export async function POST() {
  try {
    const now = new Date();

    // Find all auctions that need status updates
    const upcomingAuctions = await prisma.auction.findMany({
      where: {
        status: "UPCOMING",
        start_date: { lte: now },
        end_date: { gt: now },
      },
    });

    const activeAuctions = await prisma.auction.findMany({
      where: {
        status: "ACTIVE",
        end_date: { lte: now },
      },
    });

    const endedAuctions = await prisma.auction.findMany({
      where: {
        status: { in: ["UPCOMING", "ACTIVE"] },
        end_date: { lte: now },
      },
    });

    // Update UPCOMING → ACTIVE
    const updatedToActive = await Promise.all(
      upcomingAuctions.map(async (auction) => {
        const updated = await prisma.auction.update({
          where: { id: auction.id },
          data: { status: "ACTIVE" },
          include: {
            property: { select: { name: true } },
          },
        });
        
        // Create audit log
        await logAction(
          "UPDATE",
          "Auction",
          auction.id,
          "System",
          "system",
          `Auction ${auction.id} status automatically updated to ACTIVE`
        ).catch(() => {});
        
        // Create notification
        await createNotification(
          `Auction for "${updated.property.name}" is now ACTIVE`,
          "auction"
        ).catch(() => {});
        
        return updated;
      })
    );

    // Update ACTIVE → ENDED
    const updatedToEnded = await Promise.all(
      endedAuctions.map(async (auction) => {
        const updated = await prisma.auction.update({
          where: { id: auction.id },
          data: { status: "ENDED" },
          include: {
            property: { select: { name: true } },
          },
        });
        
        // Create audit log
        await logAction(
          "UPDATE",
          "Auction",
          auction.id,
          "System",
          "system",
          `Auction ${auction.id} status automatically updated to ENDED`
        ).catch(() => {});
        
        // Create notification
        await createNotification(
          `Auction for "${updated.property.name}" has ENDED`,
          "auction"
        ).catch(() => {});
        
        return updated;
      })
    );

    return NextResponse.json({
      success: true,
      updated: {
        toActive: updatedToActive.length,
        toEnded: updatedToEnded.length,
      },
    });
  } catch (error) {
    console.error("Error updating auction statuses:", error);
    return NextResponse.json(
      { error: "Failed to update auction statuses" },
      { status: 500 }
    );
  }
}

// ✅ GET: Check and return status update info (for debugging)
export async function GET() {
  try {
    const now = new Date();

    const upcomingToActive = await prisma.auction.count({
      where: {
        status: "UPCOMING",
        start_date: { lte: now },
        end_date: { gt: now },
      },
    });

    const activeToEnded = await prisma.auction.count({
      where: {
        status: { in: ["UPCOMING", "ACTIVE"] },
        end_date: { lte: now },
      },
    });

    return NextResponse.json({
      pendingUpdates: {
        toActive: upcomingToActive,
        toEnded: activeToEnded,
      },
      currentTime: now.toISOString(),
    });
  } catch (error) {
    console.error("Error checking auction statuses:", error);
    return NextResponse.json(
      { error: "Failed to check auction statuses" },
      { status: 500 }
    );
  }
}

