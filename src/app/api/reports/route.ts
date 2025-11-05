import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get date range from query params (default: 7 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7", 10);
    const dateRange = Math.max(1, Math.min(365, days)); // Clamp between 1 and 365 days

    // Get basic counts
    const [totalBidders, totalProperties, totalAuctions, totalBids] =
      await Promise.all([
        prisma.user.count({
          where: { role: "bidder" },
        }),
        prisma.property.count(),
        prisma.auction.count(),
        prisma.bid.count(),
      ]);

    // Calculate total revenue (sum of all bid amounts)
    const revenueResult = await prisma.bid.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Bids per day (last N days based on dateRange)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const bidsPerDay = [];
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0); // Start of day
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const count = await prisma.bid.count({
        where: {
          created_at: { gte: date, lt: nextDate },
        },
      });
      bidsPerDay.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    // Properties by status
    const props = await prisma.property.groupBy({
      by: ["status"],
      _count: { status: true },
    });
    const propertiesByStatus = props.map((p: any) => ({
      status: p.status,
      count: p._count.status,
    }));

    // Top bidders by total bid amount
    const topBiddersRaw = await prisma.bid.groupBy({
      by: ["bidderId"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const topBidders = await Promise.all(
      topBiddersRaw.map(async (b: any) => {
        const user = await prisma.user.findUnique({
          where: { id: b.bidderId },
        });
        return {
          name: user?.name || "Unknown",
          totalBids: b._sum.amount || 0,
        };
      })
    );

    return NextResponse.json({
      totalBidders,
      totalProperties,
      totalAuctions,
      totalBids,
      totalRevenue,
      bidsPerDay,
      propertiesByStatus,
      topBidders,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 }
    );
  }
}

