import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const permissionNames = ["enterprise:read", "enterprise:write"];

  await prisma.permission.createMany({
    data: permissionNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const permissions = await prisma.permission.findMany({
    where: {
      name: {
        in: permissionNames,
      },
    },
  });

  await prisma.enterprise.upsert({
    where: { email: "demo@orquestra.local" },
    update: {},
    create: {
      email: "demo@orquestra.local",
      password: "seed-placeholder",
      name: "Orquestra Demo",
      contact_1: "+55 11 99999-0000",
      cnpj: "00000000000000",
      AccountVerification: true,
      address: {
        create: {
          house_number: "100",
          street: "Rua Prisma",
          district: "Centro",
          city: "Sao Paulo",
          state: "SP",
          complement: "Seed data",
        },
      },
      roles: {
        create: [
          {
            name: "admin",
            permissions: {
              connect: permissions.map((permission) => ({ id: permission.id })),
            },
          },
        ],
      },
      administrative_modules: {
        create: [
          {
            name: "Operations",
            sectors: {
              create: [{ name: "Support" }],
            },
          },
        ],
      },
      members: {
        create: [
          {
            name: "Demo Member",
            email: "member@orquestra.local",
            password: "seed-placeholder",
            contact_1: "+55 11 98888-0000",
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
