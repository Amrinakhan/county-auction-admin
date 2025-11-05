import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { is_visible } = body;

    const control = await prisma.visibilityControl.update({
      where: { id },
      data: {
        is_visible: is_visible ?? false,
      },
      include: {
        county: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(control);
  } catch (error) {
    console.error("Error updating visibility control:", error);
    return NextResponse.json(
      { error: "Failed to update visibility control" },
      { status: 500 }
    );
  }
}

