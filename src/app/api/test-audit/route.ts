import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAction } from "@/lib/auditLogger";

export async function GET() {
  try {
    // Test 1: Check if table exists by trying to query it
    const testQuery = await prisma.$queryRaw`SELECT COUNT(*) as count FROM audit_log`;
    console.log("✅ Table exists, count:", testQuery);

    // Test 2: Try to create a log directly
    const directTest = await prisma.auditLog.create({
      data: {
        action: "TEST",
        entity: "TestEntity",
        entityId: 999,
        performedBy: "Test User",
        role: "admin",
        details: "Direct Prisma test",
      },
    });
    console.log("✅ Direct Prisma create successful:", directTest);

    // Test 3: Try using logAction function
    const functionTest = await logAction(
      "TEST_FUNCTION",
      "TestEntity",
      888,
      "Test User",
      "admin",
      "Function test"
    );
    console.log("✅ logAction function test:", functionTest);

    // Get all logs
    const allLogs = await prisma.auditLog.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      message: "All tests passed",
      tableExists: true,
      directCreate: directTest,
      functionTest: functionTest,
      recentLogs: allLogs,
    });
  } catch (error: any) {
    console.error("❌ Test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}

