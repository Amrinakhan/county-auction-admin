import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ model: string }> | { model: string } }
) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const model = resolvedParams.model;
  try {
    let data: any[] = [];

    switch (model) {
      case "counties":
        data = await prisma.county.findMany({
          select: {
            id: true,
            name: true,
            contact_name: true,
            contact_email: true,
            subscription_status: true,
            created_at: true,
          },
        });
        break;

      case "properties":
        data = await prisma.property.findMany({
          select: {
            id: true,
            map_id: true,
            sale_id: true,
            title: true,
            owner: true,
            address: true,
            status: true,
            created_at: true,
          },
        });
        break;

      case "bidders":
        data = await prisma.user.findMany({
          where: {
            role: "bidder",
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            county: true,
            created_at: true,
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid model" },
          { status: 400 }
        );
    }

    // Convert to CSV
    const csv = Papa.unparse(data);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${model}-export.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

