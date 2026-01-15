import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const parentPassword = await bcrypt.hash("parent123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@daycare.com" },
    update: {},
    create: {
      email: "admin@daycare.com",
      password_hash: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "professor@daycare.com" },
    update: {},
    create: {
      email: "professor@daycare.com",
      password_hash: teacherPassword,
      role: "TEACHER",
    },
  });

  await prisma.teacher.upsert({
    where: { user_id: teacherUser.id },
    update: {},
    create: {
      user_id: teacherUser.id,
      full_name: "Maria Silva",
      email: "professor@daycare.com",
      phone: "(11) 99999-0001",
      classroom: "Turma da Tia Maria",
    },
  });

  const parentUser = await prisma.user.upsert({
    where: { email: "pai@daycare.com" },
    update: {},
    create: {
      email: "pai@daycare.com",
      password_hash: parentPassword,
      role: "PARENT",
    },
  });

  const parent = await prisma.parent.upsert({
    where: { user_id: parentUser.id },
    update: {},
    create: {
      user_id: parentUser.id,
      full_name: "João Santos",
      email: "pai@daycare.com",
      phone: "(11) 99999-0002",
    },
  });

  const child = await prisma.child.upsert({
    where: { id: "test-child-1" },
    update: {},
    create: {
      id: "test-child-1",
      full_name: "Alice Santos",
      birth_date: new Date("2022-05-15"),
      classroom: "Turma da Tia Maria",
    },
  });

  await prisma.parentChildLink.upsert({
    where: {
      parent_id_child_id: {
        parent_id: parent.id,
        child_id: child.id,
      },
    },
    update: {},
    create: {
      parent_id: parent.id,
      child_id: child.id,
      relationship: "parent",
      is_primary: true,
      can_pickup: true,
    },
  });

  console.log("Database seeded successfully!");
  console.log("\nTest accounts created:");
  console.log("- Admin: admin@daycare.com / admin123");
  console.log("- Teacher: professor@daycare.com / teacher123");
  console.log("- Parent: pai@daycare.com / parent123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
