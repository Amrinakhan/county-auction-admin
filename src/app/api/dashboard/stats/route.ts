import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔵 Fetching dashboard stats...");
    
    const [totalCounties, totalProperties, totalBidders, activeBids, unreadNotifications] =
      await Promise.all([
        prisma.county.count(),
        prisma.property.count(),
        prisma.user.count({
          where: {
            role: "bidder",
          },
        }),
        prisma.bid.count({
          where: {
            OR: [
              { status: "pending" },
              { status: "approved" },
              { status: "Pending" },
              { status: "Approved" },
            ],
          },
        }),
        prisma.notification.count({
          where: {
            is_read: false,
          },
        }),
      ]);

    console.log("✅ Dashboard stats:", {
      totalCounties,
      totalProperties,
      totalBidders,
      activeBids,
      unreadNotifications,
    });

    return NextResponse.json({
      totalCounties,
      totalProperties,
      totalBidders,
      activeBids,
      unreadNotifications,
    });
  } catch (error: any) {
    console.error("❌ Error fetching dashboard stats:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        error: "Failed to load stats",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

