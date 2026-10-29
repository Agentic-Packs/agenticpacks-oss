import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AgenticPacks OSS database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Seed Demo Developer User
  const user = await prisma.user.upsert({
    where: { email: "user@demo.com" },
    update: {
      passwordHash,
      role: "USER",
      plan: "free",
      credits: 100,
    },
    create: {
      email: "user@demo.com",
      name: "Demo Developer",
      passwordHash,
      role: "USER",
      plan: "free",
      credits: 100,
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Demo user seeded: ${user.email} (password: password123)`);

  // 2. Seed a Sample Welcome Conversation
  const existingConv = await prisma.conversation.findFirst({
    where: { userId: user.id },
  });

  if (!existingConv) {
    const conv = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "Welcome to AgenticPacks OSS",
        messages: {
          create: [
            {
              role: "user",
              content: "Hello! What can I build with this community starter?",
            },
            {
              role: "assistant",
              content:
                "Welcome to **AgenticPacks OSS**! You have a production-ready Next.js 15 App Router foundation with Auth.js v5 authentication, PostgreSQL + Prisma database persistence, and OpenAI streaming chat. You can build AI chatbots, content generators, personal writing tools, and more!",
              promptTokens: 15,
              completionTokens: 48,
            },
          ],
        },
      },
    });
    console.log(`✅ Welcome conversation seeded: "${conv.title}"`);
  }

  console.log("\n🎉 Seeding complete! Ready for development.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
