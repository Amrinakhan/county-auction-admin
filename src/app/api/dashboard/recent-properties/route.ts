import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔵 Fetching recent properties...");
    
    const properties = await prisma.property.findMany({
      include: {
        bidder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 5,
    });

    console.log("✅ Recent properties fetched:", properties.length);

    // Map properties to match dashboard expectations
    const formattedProperties = properties.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      county: p.county, // This is a string, not a relation
      price: p.price,
      status: p.status,
      owner: p.bidder?.name || "Not assigned", // Using bidder as owner
      created_at: p.created_at,
      bidder: p.bidder,
    }));

    return NextResponse.json(formattedProperties);
  } catch (error: any) {
    console.error("❌ Error fetching recent properties:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    // Return empty array on error instead of error object
    return NextResponse.json([]);
  }
}

