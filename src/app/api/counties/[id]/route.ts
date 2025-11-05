import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAction } from "@/lib/auditLogger";
import { createNotification } from "@/lib/notificationLogger";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid county ID" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { name, state, visible } = body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "County name is required" },
        { status: 400 }
      );
    }

    // Get county details before update for audit log
    const existingCounty = await prisma.county.findUnique({
      where: { id },
    });

    if (!existingCounty) {
      return NextResponse.json(
        { error: "County not found" },
        { status: 404 }
      );
    }

    const county = await prisma.county.update({
      where: { id },
      data: {
        name: name.trim(),
        state: state?.trim() || null,
        visible: visible !== undefined ? visible : true,
      },
    });

    // Create audit log
    await logAction(
      "UPDATE",
      "County",
      id,
      "Admin User",
      "admin",
      `County "${county.name}" updated successfully`
    ).catch(() => {});

    // Create notification
    await createNotification(
      `County "${county.name}" was updated`,
      "county"
    ).catch(() => {});

    return NextResponse.json(county);
  } catch (error: any) {
    console.error("Error updating county:", error);
    
    let errorMessage = "Failed to update county";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "County not found";
      statusCode = 404;
    } else if (error?.code === "P2002") {
      errorMessage = "A county with this name already exists";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid county ID" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { visible } = body;

    const county = await prisma.county.update({
      where: { id },
      data: {
        visible: visible !== undefined ? visible : true,
      },
    });

    // Create audit log
    await logAction(
      "UPDATE",
      "County",
      id,
      "Admin User",
      "admin",
      `County "${county.name}" visibility set to ${county.visible ? "visible" : "hidden"}`
    ).catch(() => {});

    return NextResponse.json(county);
  } catch (error: any) {
    console.error("Error toggling county visibility:", error);
    
    let errorMessage = "Failed to update county visibility";
    let statusCode = 500;
    
    if (error?.code === "P2025") {
      errorMessage = "County not found";
      statusCode = 404;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.message },
      { status: statusCode }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid county ID" },
        { status: 400 }
      );
    }

    // Get county details before deletion for audit log
    const county = await prisma.county.findUnique({
      where: { id },
    });

    if (!county) {
      return NextResponse.json(
        { error: "County not found" },
        { status: 404 }
      );
    }

    await prisma.county.delete({
      where: { id },
    });

    // Create audit log
    await logAction(
      "DELETE",
      "County",
      id,
      "Admin User",
      "admin",
      `County "${county.name}" deleted successfully`
    ).catch(() => {});

    // Create notification
    await createNotification(
      `County "${county.name}" was deleted`,
      "county"
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting county:", error);
    return NextResponse.json(
      { error: "Failed to delete county" },
      { status: 500 }
    );
  }
}

