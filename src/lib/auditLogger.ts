import prisma from "./prisma";

export async function logAction(
  action: string,
  entity: string,
  entityId: number | null = null,
  performedBy: string,
  role: string,
  details: string | null = null
) {
  // Use a promise that never rejects to ensure it never breaks the calling code
  return new Promise((resolve) => {
    (async () => {
      try {
        // Generate default details if not provided
        const logDetails = details || `${action} action performed on ${entity} by ${performedBy}`;
        
        // Check if auditLog model exists (in case Prisma client hasn't been regenerated)
        if (!prisma.auditLog) {
          console.warn("⚠️ Prisma auditLog model not found - run 'npx prisma generate'");
          resolve(null);
          return;
        }
        
        const result = await prisma.auditLog.create({
          data: {
            action,
            entity,
            entityId,
            performedBy,
            role,
            details: logDetails,
          },
        });
        
        console.log("✅ Audit log created:", result.id);
        resolve(result);
      } catch (error: any) {
        // Enhanced error logging to help debug
        console.error("❌ Audit log error (non-blocking):", {
          error: error?.message || error,
          code: error?.code,
          hint: error?.code === 'P2001' ? 'Table might not exist - run migration SQL' : 'Check Prisma client',
        });
        // Always resolve (never reject) so it doesn't break the calling code
        resolve(null);
      }
    })();
  });
}

