import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAction } from "@/lib/auditLogger";

// GET: Fetch user settings (if stored in DB)
export async function GET() {
  try {
    // For now, return settings from localStorage (handled client-side)
    // In production, fetch from database:
    // const settings = await prisma.userSettings.findUnique({ where: { userId } });
    
    return NextResponse.json({
      message: "Settings are stored client-side in localStorage",
      settings: {
        darkMode: false,
        emailNotifications: true,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST: Save settings (for DB storage in production)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { darkMode, emailNotifications, companyName, companyLogo } = body;

    // TODO: In production, save to database:
    // await prisma.userSettings.upsert({
    //   where: { userId: user.id },
    //   update: { darkMode, emailNotifications, companyName, companyLogo },
    //   create: { userId: user.id, darkMode, emailNotifications, companyName, companyLogo },
    // });

    // For now, log the action
    await logAction(
      "UPDATE",
      "Settings",
      null,
      "Admin User",
      "admin",
      "Settings updated"
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Settings saved (currently stored in localStorage)",
      settings: {
        darkMode,
        emailNotifications,
        companyName,
        companyLogo,
      },
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

