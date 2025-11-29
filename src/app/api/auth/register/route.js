import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  const { username, email, phone, password } = await req.json();

  const exist = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }, { username }] },
  });

  if (exist) {
    return Response.json({ success: false, error: "User sudah terdaftar!" });
  }

  const hash = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await prisma.user.create({
    data: {
      username,
      email,
      phone,
      password: hash,
      otp,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Kirim OTP via WhatsApp bot
  await fetch(process.env.WA_BOT_URL + "/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      number: phone,
      message: `Kode OTP ReNime kamu: *${otp}* (berlaku 5 menit)`
    }),
  });

  return Response.json({ success: true, user });
}
