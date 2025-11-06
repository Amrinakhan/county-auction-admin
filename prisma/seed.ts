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
      {
        name: "County House",
        location: "Hudson, NJ",
        county: "Hudson",
        price: 450000,
        status: "available",
      },
      {
        name: "Farm Land",
        location: "Essex, NJ",
        county: "Essex",
        price: 320000,
        status: "available",
      },
      {
        name: "Commercial Building",
        location: "Bergen, NJ",
        county: "Bergen",
        price: 875000,
        status: "available",
      },
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
          bidderId: users[0].id,
          propertyId: properties[0].id,
          amount: 50000,
          status: "pending",
        },
        {
          bidderId: users[1].id,
          propertyId: properties[1].id,
          amount: 75000,
          status: "pending",
        },
        {
          bidderId: users[2]?.id || users[0].id,
          propertyId: properties[0].id,
          amount: 60000,
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

