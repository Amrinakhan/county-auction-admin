import prisma from "@/lib/prisma";

export async function createAuditLog(
  action: string,
  entity: string,
  entityId: number | null = null,
  performedBy = "System",
  role = "system",
  details: string | null = null
) {
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      performedBy,
      role,
      details,
    },
  });
}

export async function createNotification(title: string, type: string = "system") {
  await prisma.notification.create({
    data: {
      title,
      type,
      is_read: false,
    },
  });
}
