import prisma from "@/lib/prisma";

export async function createAuditLog(action: string, entity: string, entityId?: number, userId?: number) {
  await prisma.auditLog.create({
    data: { action, entity, entityId, userId },
  });
}

export async function createNotification(title: string, message: string, type: string = "system") {
  await prisma.notification.create({
    data: { title, message, type },
  });
}
