import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { phone } = await req.json();

  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    return Response.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.update({
    where: { phone },
    data: {
      otp,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Kirim OTP via bot WA
  await fetch(process.env.WA_BOT_URL + "/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      number: phone,
      message: `Kode OTP ReNime kamu adalah: *${otp}* (berlaku 5 menit)`
    })
  });

  return Response.json({ success: true });
}
