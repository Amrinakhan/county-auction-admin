import prisma from "@/lib/prisma";

export async function createNotification(title: string, type: string = "System") {
  try {
    await prisma.notification.create({
      data: {
        title,
        type,
        is_read: false,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
