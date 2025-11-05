import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create users
  await prisma.user.createMany({
    data: [
      { name: "Admin User", email: "admin@test.com", role: "admin", status: "active" },
      { name: "John Bidder", email: "john@test.com", role: "bidder", status: "active" },
      { name: "Jane Bidder", email: "jane@test.com", role: "bidder", status: "active" },
    ],
    skipDuplicates: true,
  });

  // Create properties
  await prisma.property.createMany({
    data: [
      { title: "County House", county: "Hudson", status: "open" },
      { title: "Farm Land", county: "Essex", status: "closed" },
      { title: "Commercial Building", county: "Bergen", status: "open" },
    ],
    skipDuplicates: true,
  });

  // Get users and properties for bids
  const users = await prisma.user.findMany();
  const properties = await prisma.property.findMany();

  if (users.length > 0 && properties.length > 0) {
    await prisma.bid.createMany({
      data: [
        {
          user_id: users[0].id,
          item_name: properties[0].title,
          bid_amount: 50000.00,
          status: "pending",
        },
        {
          user_id: users[1].id,
          item_name: properties[1].title,
          bid_amount: 75000.00,
          status: "pending",
        },
        {
          user_id: users[2]?.id || users[0].id,
          item_name: properties[0].title,
          bid_amount: 60000.00,
          status: "pending",
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

