import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = "admin@test.local";
const newPassword = "admin123";

const run = async () => {
  const hash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.usuario.update({
    where: { email },
    data: { passwordHash: hash, activo: true, refreshTokenHash: null },
  });

  console.log("✅ Password reseteada:", user.email);
};

run()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
