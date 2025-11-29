import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, username, phone, password } = data;

    if (!name || !username || !phone || !password) {
      return new Response(
        JSON.stringify({ error: "Semua field wajib diisi!" }),
        { status: 400 }
      );
    }

    // Cek duplikasi
    const exist = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { phone }],
      },
    });

    if (exist) {
      return new Response(
        JSON.stringify({ error: "Username atau nomor sudah terdaftar!" }),
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        phone,
        password: hashed,
      },
    });

    return new Response(JSON.stringify({ success: true, newUser }), {
      status: 201,
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
      number: phone,
      message: `Kode OTP ReNime kamu: *${otp}* (berlaku 5 menit)`
    }),
  });

  return Response.json({ success: true, user });
}
